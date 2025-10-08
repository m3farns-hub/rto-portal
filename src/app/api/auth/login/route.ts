import { NextRequest, NextResponse } from 'next/server';
import { setSessionToken } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body || {};
  if (!email || !password) return new NextResponse('Missing credentials', { status: 400 });

  const tenant = req.headers.get('x-tenant-id') || 'primary';
  const ebRes = await fetch(`${process.env.EB_API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenant },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!ebRes.ok) {
    const msg = await ebRes.text().catch(()=>'Login failed');
    return new NextResponse(msg || 'Login failed', { status: 401 });
  }

  const { token } = await ebRes.json();
  setSessionToken(token);
  return NextResponse.json({ ok: true });
}

