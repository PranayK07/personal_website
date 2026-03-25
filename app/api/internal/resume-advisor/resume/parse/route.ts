import { NextRequest, NextResponse } from 'next/server';
import { internalErrorResponse, requireAdvisorAuth } from '@/lib/resume-advisor/api';
import { parseResumeText } from '@/lib/resume-advisor/pipeline/resume-parse';
import { resumeParseSchema } from '@/lib/resume-advisor/schemas';

export async function POST(req: NextRequest) {
  const authError = requireAdvisorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { rawText, source } = resumeParseSchema.parse(body);
    const result = parseResumeText(rawText, source ?? 'uploaded_resume');

    return NextResponse.json({ result });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
