import { NextRequest, NextResponse } from 'next/server';
import { internalErrorResponse, requireAdvisorAuth } from '@/lib/resume-advisor/api';
import { mergeRankSchema } from '@/lib/resume-advisor/schemas';
import { buildMergeRankResponse } from '@/lib/resume-advisor/pipeline/merge-rank';
import { profileData } from '@/data/profile';

export async function POST(req: NextRequest) {
  const authError = requireAdvisorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { jdAnalysis, resumeParseResult, llmConfig } = mergeRankSchema.parse(body);

    const response = await buildMergeRankResponse(profileData, resumeParseResult, jdAnalysis, {
      llmConfig: llmConfig ?? null,
    });

    return NextResponse.json(response);
  } catch (error) {
    return internalErrorResponse(error);
  }
}
