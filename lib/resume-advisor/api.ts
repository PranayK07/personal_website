import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { isAdvisorAuthenticatedFromRequest } from '@/lib/resume-advisor/auth';

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function requireAdvisorAuth(req: NextRequest): NextResponse | null {
  if (!isAdvisorAuthenticatedFromRequest(req)) {
    return unauthorizedResponse();
  }

  return null;
}

export async function parseJsonBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

export function internalErrorResponse(error: unknown) {
  // Local-only internal tool: log full server error for debugging in terminal.
  console.error('[resume-advisor] API error', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json({ error: message }, { status: 500 });
}
