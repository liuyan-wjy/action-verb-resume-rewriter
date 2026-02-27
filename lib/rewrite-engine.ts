import { getVerbSuggestions } from './verb-bank';
import { detectWeakMatches, stripLeadingWeakPhrase } from './weak-verbs';
import { weakVerbReplacements } from './rule-dictionaries';
import type { RewriteRequest, RewriteResponse, RewriteVariation, Tone } from './types';

const toneOrder: Tone[] = ['leadership', 'execution', 'impact'];

const toneReason: Record<Tone, string> = {
  leadership: 'Highlights ownership and decision-making scope.',
  execution: 'Emphasizes delivery discipline and operational clarity.',
  impact: 'Frames outcomes in measurable business terms.'
};

const LEAD_VERB_WORDS = new Set(
  [
    // Tone verbs
    'led',
    'spearheaded',
    'directed',
    'mentored',
    'orchestrated',
    'executed',
    'implemented',
    'delivered',
    'coordinated',
    'optimized',
    'increased',
    'reduced',
    'improved',
    'accelerated',
    'boosted',
    // Common role verbs
    'engineered',
    'built',
    'refactored',
    'automated',
    'deployed',
    'scaled',
    'debugged',
    'hardened',
    'integrated',
    'defined',
    'prioritized',
    'launched',
    'validated',
    'drove',
    'synthesized',
    'scoped',
    'aligned',
    'positioned',
    'segmented',
    'produced',
    'amplified',
    'prospected',
    'negotiated',
    'closed',
    'expanded',
    'exceeded',
    'retained',
    'generated',
    'converted',
    'standardized',
    'audited',
    'enforced',
    'monitored',
    'stabilized',
    'analyzed',
    'forecasted',
    'modeled',
    'reconciled',
    'evaluated',
    'reported',
    // Additional common resume starts
    'managed',
    'owned',
    'ran'
  ].map((word) => word.toLowerCase())
);

export function buildQuantificationHint(text: string): string {
  if (/\d/.test(text)) {
    return 'You already have measurable data; keep the strongest metric closest to the verb.';
  }
  return 'Add a measurable outcome using scope, speed, or quality (for example: reduced cycle time by X%, supported N customers, or improved SLA compliance).';
}

function cleanSentence(text: string): string {
  const trimmed = text.trim().replace(/^[-*•]\s*/, '').replace(/\.$/, '');
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function capitalizeSentence(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ').replace(/\.$/, '');
  if (!cleaned) {
    return '';
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + '.';
}

function getLeadWord(text: string): string | null {
  const first = text.trim().split(/\s+/)[0];
  if (!first) return null;
  const normalized = first.toLowerCase().replace(/[^a-z]/g, '');
  return normalized || null;
}

function startsWithActionVerb(text: string): boolean {
  const lead = getLeadWord(text);
  return Boolean(lead && LEAD_VERB_WORDS.has(lead));
}

function startWithVerb(verb: string, text: string, role: RewriteRequest['role']): string {
  const core = stripLeadingWeakPhrase(cleanSentence(text), role ?? 'general');
  if (!core) {
    return `${verb} high-priority initiatives across cross-functional stakeholders.`;
  }

  const normalizedCore = core.replace(/^to\s+/, '').replace(/^managing\s+/i, 'the management of ');

  // If input already starts with a meaningful action verb, don't prepend a second verb.
  if (startsWithActionVerb(normalizedCore)) {
    return capitalizeSentence(normalizedCore);
  }

  return capitalizeSentence(`${verb} ${normalizedCore}`);
}

function extractActionVerbFromSentence(text: string, fallback: string): string {
  const lead = getLeadWord(text);
  if (!lead) return fallback;
  return lead.charAt(0).toUpperCase() + lead.slice(1);
}

export function localRewrite(payload: RewriteRequest): RewriteResponse {
  const role = payload.role ?? 'general';
  const selectedTone = payload.tone;
  const weakMatches = detectWeakMatches(payload.text, role);
  const ruleBasedSuggestions = weakMatches.flatMap((match) => weakVerbReplacements(match.split(/\s+/)[0] ?? match));
  const bankSuggestions = getVerbSuggestions(role, selectedTone, []);
  const suggestions = Array.from(new Set([...ruleBasedSuggestions, ...bankSuggestions])).slice(0, 10);

  const tones = selectedTone ? [selectedTone, ...toneOrder.filter((tone) => tone !== selectedTone)] : toneOrder;

  const variations: RewriteVariation[] = tones.slice(0, 3).map((tone, index) => {
    const verb = getVerbSuggestions(role, tone, [])[index] ?? getVerbSuggestions(role, tone, [])[0] ?? 'Delivered';
    const rewritten = startWithVerb(verb, payload.text, role);
    return {
      tone,
      action_verb: extractActionVerbFromSentence(rewritten, verb),
      rewritten_bullet: rewritten,
      why_better: toneReason[tone],
      quantification_hint: buildQuantificationHint(payload.text)
    };
  });

  return {
    variations,
    weakMatches,
    suggestions
  };
}

export function safeParseModelResponse(raw: string): RewriteVariation[] | null {
  const firstCurly = raw.indexOf('{');
  const lastCurly = raw.lastIndexOf('}');

  if (firstCurly === -1 || lastCurly === -1 || lastCurly <= firstCurly) {
    return null;
  }

  const jsonPart = raw.slice(firstCurly, lastCurly + 1);

  try {
    const parsed = JSON.parse(jsonPart) as { variations?: RewriteVariation[] };
    if (!parsed.variations || !Array.isArray(parsed.variations)) {
      return null;
    }

    const valid = parsed.variations.filter((item) => item && item.rewritten_bullet && item.action_verb);
    return valid.slice(0, 3);
  } catch {
    return null;
  }
}
