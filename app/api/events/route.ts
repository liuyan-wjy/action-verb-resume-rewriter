import { NextResponse } from 'next/server';
import { insertAnalyticsEvent } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; payload?: Record<string, unknown> };
    const event = {
      ts: new Date().toISOString(),
      name: typeof body?.name === 'string' ? body.name : 'unknown_event',
      payload: body?.payload ?? {}
    };

    try {
      await insertAnalyticsEvent(event.name, { ...event.payload, ts: event.ts });
    } catch (storageError) {
      console.error('[analytics_event_storage_error]', storageError);
    }

    console.log('[analytics_event]', JSON.stringify(event));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Invalid payload'
      },
      { status: 400 }
    );
  }
}
