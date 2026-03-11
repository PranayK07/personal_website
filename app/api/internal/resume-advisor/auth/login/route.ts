import { NextRequest, NextResponse } from 'next/server';
import { createAdvisorSessionToken, getAdvisorPassword, getSessionCookieName } from '@/lib/resume-advisor/auth';
import { loginSchema } from '@/lib/resume-advisor/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = loginSchema.parse(body);

    const expectedPassword = getAdvisorPassword();
    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'Server is missing RESUME_ADVISOR_PASSWORD.' },
        { status: 500 },
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }

    const token = createAdvisorSessionToken();
    const response = NextResponse.json({ ok: true });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
