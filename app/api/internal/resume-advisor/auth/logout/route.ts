import { NextResponse } from 'next/server';
import { getSessionCookieName } from '@/lib/resume-advisor/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(getSessionCookieName(), '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });

  return response;
}
