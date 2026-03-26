import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Rate limiting configuration - Token bucket algorithm
const RATE_LIMIT_CONFIG = {
  MAX_TOKENS: 10, // Maximum requests allowed in window
  REFILL_RATE: 1, // Tokens refilled per minute
  REFILL_INTERVAL: 60_000, // 1 minute in milliseconds
  COOLDOWN_MS: 10_000, // 10 seconds cooldown after hitting limit
};

// Input validation configuration
const INPUT_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000, // Maximum characters per message
  MAX_MESSAGES_HISTORY: 20, // Maximum conversation history
  MAX_TOTAL_CONTEXT: 10000, // Maximum total context characters
};

// Security patterns to detect prompt injection attempts
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
  /new\s+instructions?:/gi,
  /system\s*:\s*/gi,
  /\[SYSTEM\]/gi,
  /\<\|im_start\|\>/gi,
  /\<\|im_end\|\>/gi,
  /<\s*script[\s\S]*?>/gi,
  /javascript\s*:/gi,
];

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
  lastRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const rateLimitCooldowns = new Map<string, number>();

/**
 * Cleans up old rate limit entries to prevent memory leaks
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 3600_000; // 1 hour

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRequest > CLEANUP_THRESHOLD) {
      rateLimitStore.delete(key);
    }
  }

  for (const [key, timestamp] of rateLimitCooldowns.entries()) {
    if (now - timestamp > RATE_LIMIT_CONFIG.COOLDOWN_MS) {
      rateLimitCooldowns.delete(key);
    }
  }
}

// Clean up every 10 minutes
setInterval(cleanupRateLimitStore, 600_000);

/**
 * Implements token bucket rate limiting algorithm
 */
function checkRateLimit(clientId: string): { allowed: boolean; remainingTokens: number; waitTime?: number } {
  const now = Date.now();

  // Check if client is in cooldown
  const cooldownUntil = rateLimitCooldowns.get(clientId);
  if (cooldownUntil && now < cooldownUntil) {
    const waitTime = Math.ceil((cooldownUntil - now) / 1000);
    return { allowed: false, remainingTokens: 0, waitTime };
  }

  let entry = rateLimitStore.get(clientId);

  if (!entry) {
    entry = {
      tokens: RATE_LIMIT_CONFIG.MAX_TOKENS,
      lastRefill: now,
      lastRequest: now,
    };
    rateLimitStore.set(clientId, entry);
  }

  // Refill tokens based on time elapsed
  const timeSinceRefill = now - entry.lastRefill;
  const tokensToAdd = Math.floor(timeSinceRefill / RATE_LIMIT_CONFIG.REFILL_INTERVAL) * RATE_LIMIT_CONFIG.REFILL_RATE;

  if (tokensToAdd > 0) {
    entry.tokens = Math.min(RATE_LIMIT_CONFIG.MAX_TOKENS, entry.tokens + tokensToAdd);
    entry.lastRefill = now;
  }

  // Check if tokens are available
  if (entry.tokens < 1) {
    // Set cooldown
    const cooldownUntil = now + RATE_LIMIT_CONFIG.COOLDOWN_MS;
    rateLimitCooldowns.set(clientId, cooldownUntil);
    const waitTime = Math.ceil(RATE_LIMIT_CONFIG.COOLDOWN_MS / 1000);
    return { allowed: false, remainingTokens: 0, waitTime };
  }

  // Consume a token
  entry.tokens -= 1;
  entry.lastRequest = now;

  return { allowed: true, remainingTokens: Math.floor(entry.tokens) };
}

/**
 * Sanitizes user input by removing/escaping potentially harmful content
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .slice(0, INPUT_LIMITS.MAX_MESSAGE_LENGTH); // Enforce length limit
}

/**
 * Detects potential prompt injection attempts
 */
function detectPromptInjection(text: string): boolean {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates message array and content
 */
function validateMessages(messages: unknown): messages is Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!Array.isArray(messages)) {
    return false;
  }

  if (messages.length === 0 || messages.length > INPUT_LIMITS.MAX_MESSAGES_HISTORY) {
    return false;
  }

  let totalChars = 0;

  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return false;
    }

    const { role, content } = msg as { role?: unknown; content?: unknown };

    if (role !== 'user' && role !== 'assistant') {
      return false;
    }

    if (typeof content !== 'string') {
      return false;
    }

    if (content.length > INPUT_LIMITS.MAX_MESSAGE_LENGTH) {
      return false;
    }

    totalChars += content.length;

    if (totalChars > INPUT_LIMITS.MAX_TOTAL_CONTEXT) {
      return false;
    }
  }

  return true;
}

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
    // Parse request body with size limit check
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50000) {
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    // Validate messages structure and content
    if (!validateMessages(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format or content exceeds limits' },
        { status: 400 }
      );
    }

    // Identify the client for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientId = forwardedFor?.split(',')[0].trim() || realIp || 'global';

    // Apply rate limiting
    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      const waitTime = rateLimitResult.waitTime || 10;
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You're sending messages too quickly. Please wait ${waitTime} seconds before trying again.`,
          retryAfter: waitTime,
        },
        {
          status: 429,
          headers: {
            'Retry-After': waitTime.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Sanitize and validate each message
    const sanitizedMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const msg of messages) {
      const sanitized = sanitizeInput(msg.content);

      // Detect prompt injection attempts
      if (detectPromptInjection(sanitized)) {
        console.warn(`Potential prompt injection detected from client ${clientId}`);
        return NextResponse.json(
          {
            error: 'Invalid input detected',
            message: 'Your message contains potentially harmful content. Please rephrase your question.',
          },
          { status: 400 }
        );
      }

      sanitizedMessages.push({
        role: msg.role,
        content: sanitized,
      });
    }

    // Load context dynamically from files
    const systemPrompt = await loadContextFromFiles();

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...sanitizedMessages,
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
      let messagesForModel: Array<{ role: string; content: string }> = groqMessages;
      if (model === 'meta-llama/llama-prompt-guard-2-86m') {
        const MAX_MESSAGES_FOR_GUARD = 8; // keep context small for this model
        if (groqMessages.length > MAX_MESSAGES_FOR_GUARD) {
          // Always keep the system prompt (index 0) and the most recent messages
          const recent = groqMessages.slice(-(MAX_MESSAGES_FOR_GUARD - 1));
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
        if (sinceLast < RATE_LIMIT_CONFIG.COOLDOWN_MS) {
          // Still within an existing cooldown window; extend remaining based on that.
          remainingMs = RATE_LIMIT_CONFIG.COOLDOWN_MS - sinceLast;
        } else {
          // New cooldown window starts now.
          remainingMs = RATE_LIMIT_CONFIG.COOLDOWN_MS;
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
