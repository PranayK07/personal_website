import { normalizeText } from '@/lib/resume-advisor/pipeline/text';
import { LLMConfig, LLMProvider } from '@/lib/resume-advisor/types';

type ResumeAdvisorProvider = LLMProvider;

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';
const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';
const DEFAULT_HUGGINGFACE_MODEL = 'Qwen/Qwen2.5-72B-Instruct';

export interface LLMCallMeta {
  provider: ResumeAdvisorProvider;
  model: string;
}

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

function normalizeProvider(raw: string | undefined): ResumeAdvisorProvider {
  const value = (raw || '').toLowerCase();
  if (value === 'gemini') return 'gemini';
  if (value === 'huggingface') return 'huggingface';
  return 'groq';
}

function getProvider(override?: Partial<LLMCallMeta> | LLMConfig | null): ResumeAdvisorProvider {
  if (override?.provider) {
    return normalizeProvider(override.provider);
  }

  return normalizeProvider(process.env.RESUME_ADVISOR_PROVIDER || 'groq');
}

function getModel(
  provider: ResumeAdvisorProvider,
  override?: Partial<LLMCallMeta> | LLMConfig | null,
): string {
  if (override?.model) {
    return override.model;
  }

  if (process.env.RESUME_ADVISOR_MODEL) {
    return process.env.RESUME_ADVISOR_MODEL;
  }

  if (provider === 'gemini') {
    return DEFAULT_GEMINI_MODEL;
  }

  if (provider === 'huggingface') {
    return DEFAULT_HUGGINGFACE_MODEL;
  }

  return DEFAULT_GROQ_MODEL;
}

function resolveLLM(override?: Partial<LLMCallMeta> | LLMConfig | null): LLMCallMeta {
  const provider = getProvider(override);
  return {
    provider,
    model: getModel(provider, override),
  };
}

export function getConfiguredLLM(override?: Partial<LLMCallMeta> | LLMConfig | null): LLMCallMeta {
  return resolveLLM(override);
}

function extractJsonObject(raw: string): string {
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');

  if (first === -1 || last === -1 || last <= first) {
    throw new Error('Model did not return a JSON object.');
  }

  return raw.slice(first, last + 1);
}

async function completeWithGroq(options: JsonCompletionOptions, model: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

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

  return raw;
}

async function completeWithGemini(options: JsonCompletionOptions, model: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        role: 'system',
        parts: [{ text: options.system }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: options.user }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens ?? 1200,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini completion failed: ${response.status} ${response.statusText} - ${body}`);
  }

  const payload = await response.json();
  const parts = payload?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error('Gemini completion returned empty content.');
  }

  const raw = parts
    .map((part: { text?: string }) => part?.text || '')
    .join('\n')
    .trim();

  if (!raw) {
    throw new Error('Gemini completion returned blank text.');
  }

  return raw;
}

async function completeWithHuggingFace(options: JsonCompletionOptions, model: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY (or HF_TOKEN)');
  }

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1200,
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.user },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Hugging Face completion failed: ${response.status} ${response.statusText} - ${body}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const joined = content
      .map((item: { text?: string }) => item?.text || '')
      .join('\n')
      .trim();
    if (joined) {
      return joined;
    }
  }

  throw new Error('Hugging Face completion returned empty content.');
}

export async function completeJsonWithMeta<T>(
  options: JsonCompletionOptions,
  override?: Partial<LLMCallMeta> | LLMConfig | null,
): Promise<{ data: T; meta: LLMCallMeta }> {
  const { provider, model } = resolveLLM(override);
  const raw = provider === 'gemini'
    ? await completeWithGemini(options, model)
    : provider === 'huggingface'
      ? await completeWithHuggingFace(options, model)
      : await completeWithGroq(options, model);

  const parsed = JSON.parse(extractJsonObject(normalizeText(raw)));
  return {
    data: parsed as T,
    meta: {
      provider,
      model,
    },
  };
}

export async function completeJson<T>(
  options: JsonCompletionOptions,
  override?: Partial<LLMCallMeta> | LLMConfig | null,
): Promise<T> {
  const { data } = await completeJsonWithMeta<T>(options, override);
  return data;
}
