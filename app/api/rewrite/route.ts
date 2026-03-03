import { NextResponse } from 'next/server';
import { localRewrite, safeParseModelResponse } from '@/lib/rewrite-engine';
import type { RewriteRequest, RewriteVariation, Tone, UserRole, Seniority } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import {
  consumePurchasedCreditIfAvailable,
  consumeSubscriptionCreditIfAvailable,
  deriveAnonKey,
  ensureUserCredits,
  getDailyLimits,
  getToday,
  incrementAnonDailyUsage,
  incrementUserDailyUsage
} from '@/lib/supabase/billing';
import { persistRewrite } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function normalizeTone(value: unknown): Tone | undefined {
  const set = new Set(['leadership', 'execution', 'impact']);
  return typeof value === 'string' && set.has(value) ? (value as Tone) : undefined;
}

function normalizeRole(value: unknown): UserRole | undefined {
  const set = new Set(['general', 'engineering', 'product', 'marketing', 'sales', 'operations', 'finance']);
  return typeof value === 'string' && set.has(value) ? (value as UserRole) : undefined;
}

function normalizeSeniority(value: unknown): Seniority | undefined {
  const set = new Set(['junior', 'mid', 'senior']);
  return typeof value === 'string' && set.has(value) ? (value as Seniority) : undefined;
}

function buildPrompt(payload: RewriteRequest): string {
  return [
    'Rewrite this resume bullet into 3 strong action-verb variations.',
    'Rules:',
    '1) Do not invent achievements, numbers, or responsibilities.',
    '2) Keep facts from the original text intact.',
    '3) Start each output sentence with a strong action verb.',
    '4) Use concise ATS-friendly language.',
    '5) Return strict JSON only in this shape:',
    '{"variations":[{"tone":"leadership|execution|impact","action_verb":"...","rewritten_bullet":"...","why_better":"...","quantification_hint":"..."}]}',
    '',
    `Input bullet: ${payload.text}`,
    `Preferred role: ${payload.role ?? 'general'}`,
    `Preferred tone: ${payload.tone ?? 'none'}`,
    `Seniority: ${payload.seniority ?? 'mid'}`
  ].join('\n');
}

function contentToText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return '';
        }
        const maybeText = (item as { text?: unknown }).text;
        return typeof maybeText === 'string' ? maybeText : '';
      })
      .join('\n');
  }

  return '';
}

function ensureThreeVariations(
  modelVariations: RewriteVariation[] | null,
  localVariations: RewriteVariation[]
): RewriteVariation[] {
  const merged = [...(modelVariations ?? []), ...localVariations];
  const deduped: RewriteVariation[] = [];
  const seen = new Set<string>();

  for (const item of merged) {
    const key = `${item.tone}|${item.action_verb}|${item.rewritten_bullet.trim().toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(item);
    if (deduped.length === 3) {
      break;
    }
  }

  return deduped.slice(0, 3);
}

async function requestModel(model: string, payload: RewriteRequest): Promise<RewriteVariation[] | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_SITE_NAME ?? 'Action Verb Resume Rewriter'
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer. Always follow output format strictly.'
        },
        {
          role: 'user',
          content: buildPrompt(payload)
        }
      ]
    }),
    signal: AbortSignal.timeout(20000)
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  const parsed = safeParseModelResponse(contentToText(content));
  return parsed;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RewriteRequest>;

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length < 6) {
      return NextResponse.json({ error: 'Please provide a longer bullet point.' }, { status: 400 });
    }

    const payload: RewriteRequest = {
      text: body.text.trim(),
      role: normalizeRole(body.role) ?? 'general',
      tone: normalizeTone(body.tone),
      seniority: normalizeSeniority(body.seniority) ?? 'mid'
    };

    const limits = getDailyLimits();
    const usageDate = getToday();
    let userId: string | null = null;
    let anonKey: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      userId = user?.id ?? null;
    } catch {
      userId = null;
    }

    if (userId) {
      await ensureUserCredits(userId);

      const purchased = await consumePurchasedCreditIfAvailable(userId);
      if (!purchased.consumed) {
        const subscription = await consumeSubscriptionCreditIfAvailable(userId);
        if (!subscription.consumed) {
          await incrementUserDailyUsage(userId, usageDate, limits.user);
        }
      }
    } else {
      const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
      const userAgent = request.headers.get('user-agent');
      anonKey = deriveAnonKey(rawIp, userAgent);
      await incrementAnonDailyUsage(anonKey, usageDate, limits.anonymous);
    }

    const models = [
      process.env.OPENROUTER_PRIMARY_MODEL ?? 'openai/gpt-4o-mini',
      process.env.OPENROUTER_FALLBACK_MODEL ?? 'openai/gpt-4o-mini'
    ].filter(Boolean);

    let modelVariations: RewriteVariation[] | null = null;
    let modelUsed: string | null = null;

    for (const model of models) {
      try {
        modelVariations = await requestModel(model, payload);
      } catch {
        modelVariations = null;
      }
      if (modelVariations && modelVariations.length > 0) {
        modelUsed = model;
        break;
      }
    }

    const local = localRewrite(payload);
    const variations = ensureThreeVariations(modelVariations, local.variations);

    try {
      await persistRewrite({
        userId,
        anonKey,
        inputText: payload.text,
        role: payload.role ?? 'general',
        tone: payload.tone ?? null,
        seniority: payload.seniority ?? 'mid',
        provider: modelUsed ? 'openrouter' : 'local',
        model: modelUsed,
        weakMatches: local.weakMatches,
        suggestions: local.suggestions,
        variations
      });
    } catch (persistError) {
      console.error('[rewrite_persist_error]', persistError);
    }

    return NextResponse.json({
      variations,
      weakMatches: local.weakMatches,
      suggestions: local.suggestions
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    if (detail.includes('Daily free quota reached') || detail.includes('Anonymous daily quota reached')) {
      return NextResponse.json(
        {
          error: detail
        },
        { status: 429 }
      );
    }

    console.error('[rewrite_error]', error);
    return NextResponse.json(
      {
        error: 'Rewrite failed'
      },
      { status: 500 }
    );
  }
}
