import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are PranayAI, a knowledgeable assistant representing Pranay Kakkar. 
Answer questions about Pranay's background, education, projects, work experience, and skills 
in a friendly, professional manner.`; // (shortened for clarity)

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

    // Include the system prompt at the start of the conversation
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    // ✅ Call Groq’s Chat API (OpenAI-compatible)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // you can change to any available Groq model
        messages: groqMessages,
        stream: true, // enables token streaming
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    // Stream tokens as they arrive
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        controller.enqueue(new TextEncoder().encode(text));
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
      { error: 'Something went wrong processing your message.' },
      { status: 500 }
    );
  }
}
