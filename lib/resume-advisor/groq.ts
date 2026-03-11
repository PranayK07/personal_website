import { normalizeText } from '@/lib/resume-advisor/pipeline/text';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';

interface GroqMessage {
  role: 'system' | 'user';
  content: string;
}

interface JsonCompletionOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

function extractJsonObject(raw: string): string {
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');

  if (first === -1 || last === -1 || last <= first) {
    throw new Error('Model did not return a JSON object.');
  }

  return raw.slice(first, last + 1);
}

export async function completeJson<T>(options: JsonCompletionOptions): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const model = process.env.RESUME_ADVISOR_MODEL || DEFAULT_MODEL;

  const messages: GroqMessage[] = [
    { role: 'system', content: options.system },
    { role: 'user', content: options.user },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1200,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq completion failed: ${response.status} ${response.statusText} - ${body}`);
  }

  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;

  if (!raw || typeof raw !== 'string') {
    throw new Error('Groq completion returned empty content.');
  }

  const parsed = JSON.parse(extractJsonObject(normalizeText(raw)));
  return parsed as T;
}
