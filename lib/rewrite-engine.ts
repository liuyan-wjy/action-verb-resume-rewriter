import { getVerbSuggestions } from './verb-bank';
import { detectWeakMatches, stripLeadingWeakPhrase } from './weak-verbs';
import type { RewriteRequest, RewriteResponse, RewriteVariation, Tone } from './types';

const toneOrder: Tone[] = ['leadership', 'execution', 'impact'];

const toneReason: Record<Tone, string> = {
  leadership: 'Highlights ownership and decision-making scope.',
  execution: 'Emphasizes delivery discipline and operational clarity.',
  impact: 'Frames outcomes in measurable business terms.'
};

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

function startWithVerb(verb: string, text: string): string {
  const core = stripLeadingWeakPhrase(cleanSentence(text));
  if (!core) {
    return `${verb} high-priority initiatives across cross-functional stakeholders.`;
  }

  const normalizedCore = core.replace(/^to\s+/, '').replace(/^managing\s+/i, 'the management of ');
  return `${verb} ${normalizedCore}`.replace(/\s+/g, ' ').trim() + '.';
}

export function localRewrite(payload: RewriteRequest): RewriteResponse {
  const role = payload.role ?? 'general';
  const selectedTone = payload.tone;
  const weakMatches = detectWeakMatches(payload.text);
  const suggestions = getVerbSuggestions(role, selectedTone, []);

  const tones = selectedTone ? [selectedTone, ...toneOrder.filter((tone) => tone !== selectedTone)] : toneOrder;

  const variations: RewriteVariation[] = tones.slice(0, 3).map((tone, index) => {
    const verb = getVerbSuggestions(role, tone, [])[index] ?? getVerbSuggestions(role, tone, [])[0] ?? 'Delivered';
    return {
      tone,
      action_verb: verb,
      rewritten_bullet: startWithVerb(verb, payload.text),
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
