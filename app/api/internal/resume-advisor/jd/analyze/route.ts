import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobDescription } from '@/lib/resume-advisor/pipeline/jd-analysis';
import { jdAnalyzeSchema } from '@/lib/resume-advisor/schemas';
import { internalErrorResponse, requireAdvisorAuth } from '@/lib/resume-advisor/api';

export async function POST(req: NextRequest) {
  const authError = requireAdvisorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { jdText } = jdAnalyzeSchema.parse(body);
    const analysis = await analyzeJobDescription(jdText);

    return NextResponse.json({ analysis });
  } catch (error) {
    return internalErrorResponse(error);
  }
}
