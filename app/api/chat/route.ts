import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple in-memory per-client cooldown tracking, only used after Groq rate-limit errors
const COOLDOWN_MS = 10_000; // 10 seconds
const rateLimitCooldowns = new Map<string, number>();

/**
 * Dynamically loads context from markdown and text files in the context folder
 */
async function loadContextFromFiles(): Promise<string> {
  try {
    const contextDir = path.join(process.cwd(), 'app', 'api', 'chat', 'context');
    const files = await fs.readdir(contextDir);

    // Filter for markdown and text files
    const contextFiles = files.filter(file =>
      file.endsWith('.md') || file.endsWith('.txt')
    );

    if (contextFiles.length === 0) {
      // Return default prompt if no context files exist
      return `You are PranayAI, a knowledgeable assistant. Be friendly, professional, and conversational.`;
    }

    // Read and combine all context files
    const contextPromises = contextFiles.map(async (file) => {
      const filePath = path.join(contextDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    });

    const contexts = await Promise.all(contextPromises);
    return contexts.join('\n\n---\n\n');
  } catch (error) {
    console.error('Error loading context files:', error);
    // Fallback to default prompt if there's an error
    return `You are PranayAI, a knowledgeable assistant. Be friendly, professional, and conversational.`;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing messages array in request body' },
        { status: 400 }
      );
    }

    // Identify the client once, used for optional rate-limit cooldown messaging
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientId =
      forwardedFor?.split(',')[0].trim() ||
      realIp ||
      'global';

    // Load context dynamically from files
    const systemPrompt = await loadContextFromFiles();

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // Model priority chain:
    // 1. openai/gpt-oss-120b (primary)
    // 2. meta-llama/llama-prompt-guard-2-86m (fallback on rate limit)
    // 3. llama-3.3-70b-versatile (final fallback on rate limit)
    const modelChain = [
      'openai/gpt-oss-120b',
      'meta-llama/llama-prompt-guard-2-86m',
      'llama-3.3-70b-versatile',
    ];

    let response: Response | null = null;
    let lastErrorBody: string | null = null;
    let lastStatusText: string | null = null;
    let sawRateLimitError = false;

    for (let i = 0; i < modelChain.length; i++) {
      const model = modelChain[i];
      const isLastModel = i === modelChain.length - 1;

      // Allow shorter context for the prompt-guard model to avoid length errors
      let messagesForModel: Message[] = groqMessages;
      if (model === 'meta-llama/llama-prompt-guard-2-86m') {
        const MAX_MESSAGES_FOR_GUARD = 8; // keep context small for this model
        if (groqMessages.length > MAX_MESSAGES_FOR_GUARD) {
          // Always keep the system prompt (index 0) and the most recent messages
          const recent = groqMessages.slice(- (MAX_MESSAGES_FOR_GUARD - 1));
          messagesForModel = [groqMessages[0], ...recent];
        }
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messagesForModel,
          stream: true,
        }),
      });

      if (res.ok) {
        response = res;
        break;
      }

      const errorBody = await res.text();
      lastErrorBody = errorBody;
      lastStatusText = res.statusText;
      console.error(`Groq API error for model ${model}:`, errorBody);

      // If we're rate limited on this model, try the next one in the chain.
      const isRateLimit =
        res.status === 429 ||
        errorBody.toLowerCase().includes('rate limit');

      if (isRateLimit) {
        sawRateLimitError = true;
      }

      // For non-rate-limit errors, try the next model if available;
      // only surface the error immediately if this is the last model.
      if (!isRateLimit && isLastModel) {
        throw new Error(`Groq API error for model ${model}: ${res.status} ${res.statusText} - ${errorBody}`);
      }

      // Otherwise, move on to the next model in the chain
      continue;
    }

    if (!response) {
      // If all models failed and we saw at least one rate-limit error, trigger a user-facing cooldown.
      if (sawRateLimitError) {
        const now = Date.now();
        const lastRateLimit = rateLimitCooldowns.get(clientId) ?? 0;
        const sinceLast = now - lastRateLimit;

        let remainingMs: number;
        if (sinceLast < COOLDOWN_MS) {
          // Still within an existing cooldown window; extend remaining based on that.
          remainingMs = COOLDOWN_MS - sinceLast;
        } else {
          // New cooldown window starts now.
          remainingMs = COOLDOWN_MS;
        }

        const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
        rateLimitCooldowns.set(clientId, now);

        const cooldownMessage =
          `You’re sending messages a bit too quickly and I’m hitting my rate limit. ` +
          `Please wait about ${remainingSeconds} seconds before sending another question.`;

        return new Response(cooldownMessage, {
          status: 429,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }

      // If we didn't see a rate-limit error, surface the last error as before.
      throw new Error(
        `All Groq models exhausted. Last error: ${lastStatusText ?? 'unknown'} - ${lastErrorBody ?? 'no body'}`
      );
    }

    // Stream & parse Server-Sent Events from Groq safely, handling partial chunks
    const textDecoder = new TextDecoder();
    const textEncoder = new TextEncoder();
    let buffer = '';

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Accumulate chunk text in a buffer because SSE frames can be split across chunks
        buffer += textDecoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last partial line (if any) in the buffer for the next chunk
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trimStart();

          if (!line || !line.startsWith('data:')) continue;

          const data = line.slice('data:'.length).trimStart();

          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              controller.enqueue(textEncoder.encode(content));
            }
          } catch (e) {
            console.error('Error parsing Groq API response:', e, 'Raw data:', data);
          }
        }
      },
      flush(controller) {
        // Process any remaining buffered data when the stream ends
        const remaining = buffer.trimStart();
        if (!remaining || !remaining.startsWith('data:')) return;

        const data = remaining.slice('data:'.length).trimStart();
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;

          if (content) {
            controller.enqueue(textEncoder.encode(content));
          }
        } catch (e) {
          console.error('Error parsing Groq API response in flush:', e, 'Raw data:', data);
        }
      },
    });

    if (response.body) {
      return new Response(response.body.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    } else {
      throw new Error('No response body from Groq');
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Something went wrong processing your message.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
