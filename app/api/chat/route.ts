import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Missing message in request body' },
        { status: 400 }
      );
    }

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: message,
      }),
    });

    const data = await response.text();

    const lines = data.split('\n').filter(Boolean);
    let output = '';
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        output += json.response || '';
      } catch (err) {
        console.error('Failed to parse line:', line);
      }
    }

    return NextResponse.json({ response: output.trim() });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong processing your message.' },
      { status: 500 }
    );
  }
}
