import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SESSION_COOKIE = 'resume_advisor_session';

function getSessionSecret(): string {
  return process.env.RESUME_ADVISOR_SESSION_SECRET || '';
}

export function getAdvisorRouteSlug(): string {
  return process.env.RESUME_ADVISOR_ROUTE_SLUG || '';
}

export function getAdvisorPassword(): string {
  return process.env.RESUME_ADVISOR_PASSWORD || '';
}

function createSignedToken(payload: string): string {
  const secret = getSessionSecret();
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function verifySignedToken(token: string): boolean {
  const secret = getSessionSecret();
  const [payload, signature] = token.split('.');

  if (!payload || !signature || !secret) {
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createAdvisorSessionToken(): string {
  const payload = `${Date.now()}:${crypto.randomUUID()}`;
  return createSignedToken(payload);
}

export async function isAdvisorAuthenticatedFromCookieStore(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  return verifySignedToken(token);
}

export function isAdvisorAuthenticatedFromRequest(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  return verifySignedToken(token);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}
