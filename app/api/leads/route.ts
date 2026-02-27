import { NextRequest, NextResponse } from 'next/server';
import { insertLead } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const limiter = checkRateLimit(`leads:${ip}`, 10, 60 * 60 * 1000);
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many lead submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limiter.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as { email?: string; source?: string };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const source = typeof body.source === 'string' && body.source.trim() ? body.source.trim() : 'rewriter_modal';
    const result = await insertLead(email, source);

    return NextResponse.json({ ok: true, configured: result.configured });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit lead.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
