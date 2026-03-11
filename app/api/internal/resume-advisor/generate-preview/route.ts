import { NextRequest, NextResponse } from 'next/server';
import { internalErrorResponse, requireAdvisorAuth } from '@/lib/resume-advisor/api';
import { generatePreviewSchema } from '@/lib/resume-advisor/schemas';
import { generateTailoredPreview } from '@/lib/resume-advisor/pipeline/generate-preview';

export async function POST(req: NextRequest) {
  const authError = requireAdvisorAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { jdAnalysis, mergedProfile, selectionState } = generatePreviewSchema.parse(body);

    const response = await generateTailoredPreview(mergedProfile, selectionState, jdAnalysis);

    return NextResponse.json(response);
  } catch (error) {
    return internalErrorResponse(error);
  }
}
