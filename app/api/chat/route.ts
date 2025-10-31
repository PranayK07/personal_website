import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Load context dynamically from files
    const systemPrompt = await loadContextFromFiles();

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', 
        messages: groqMessages,
        stream: true, 
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Groq API error:', errorBody);
      throw new Error(`Groq API error: ${response.statusText} - ${errorBody}`);
    }

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); 

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            } catch (e) {
                console.error('Error parsing Groq API response:', e);
            }
          }
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
