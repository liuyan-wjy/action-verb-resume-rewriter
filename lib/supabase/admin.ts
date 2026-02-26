import { createServiceClient } from '@/lib/supabase/server';

export async function insertLead(email: string, source: string) {
  const client = createServiceClient();
  if (!client) {
    return { configured: false };
  }

  const { error } = await client.from('leads').upsert(
    {
      email,
      source
    },
    { onConflict: 'email' }
  );

  if (error) {
    throw new Error(error.message);
  }

  return { configured: true };
}

export async function insertAnalyticsEvent(name: string, payload: Record<string, unknown>) {
  const client = createServiceClient();
  if (!client) {
    return { configured: false };
  }

  const { error } = await client.from('analytics_events').insert({
    event_name: name,
    payload
  });

  if (error) {
    throw new Error(error.message);
  }

  return { configured: true };
}

export async function persistRewrite(params: {
  userId?: string | null;
  anonKey?: string | null;
  inputText: string;
  role: string;
  tone: string | null;
  seniority: string;
  provider: 'openrouter' | 'local';
  model: string | null;
  weakMatches: string[];
  suggestions: string[];
  variations: Array<{
    tone: string;
    action_verb: string;
    rewritten_bullet: string;
    why_better: string;
    quantification_hint: string;
  }>;
}) {
  const client = createServiceClient();
  if (!client) {
    return { configured: false };
  }

  const { data: rewriteJob, error: jobError } = await client
    .from('rewrite_jobs')
    .insert({
      user_id: params.userId ?? null,
      anon_key: params.anonKey ?? null,
      input_text: params.inputText,
      role: params.role,
      tone: params.tone,
      seniority: params.seniority,
      provider: params.provider,
      model: params.model,
      weak_matches: params.weakMatches,
      suggestions: params.suggestions
    })
    .select('id')
    .single();

  if (jobError || !rewriteJob) {
    throw new Error(jobError?.message ?? 'Failed to persist rewrite job.');
  }

  const rows = params.variations.map((item) => ({
    rewrite_job_id: rewriteJob.id,
    tone: item.tone,
    action_verb: item.action_verb,
    rewritten_bullet: item.rewritten_bullet,
    why_better: item.why_better,
    quantification_hint: item.quantification_hint
  }));

  const { error: resultError } = await client.from('rewrite_results').insert(rows);

  if (resultError) {
    throw new Error(resultError.message);
  }

  return { configured: true, rewriteJobId: rewriteJob.id };
}
