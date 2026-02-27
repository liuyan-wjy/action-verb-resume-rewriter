import { getVerbSuggestions } from './verb-bank';
import { resolveVerbFamily } from './rule-dictionaries';
import { toVerbRoot } from './text-normalize';
import type { UserRole } from './types';

export interface RepetitionIssue {
  verb: string;
  count: number;
  alternatives: string[];
}

function extractLeadVerb(line: string): string | null {
  const cleaned = line
    .trim()
    .replace(/^[-*•\d.\)\s]+/, '')
    .replace(/[^A-Za-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (cleaned.length === 0) {
    return null;
  }

  return toVerbRoot(cleaned[0]);
}

export function findRepetitionIssues(rawText: string, role: UserRole = 'general'): RepetitionIssue[] {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const line of lines) {
    const verb = extractLeadVerb(line);
    if (!verb) {
      continue;
    }

    const family = resolveVerbFamily(verb);
    const canonical = family?.key ?? verb;
    counts.set(canonical, (counts.get(canonical) ?? 0) + 1);

    if (!labels.has(canonical)) {
      labels.set(canonical, canonical);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([canonical, count]) => {
      const family = resolveVerbFamily(canonical);
      const familyMembers = family?.members ?? [canonical];
      const familyAlternatives = family?.alternatives ?? [];
      const roleAlternatives = getVerbSuggestions(role, undefined, familyMembers).slice(0, 8);
      const alternatives = Array.from(new Set([...familyAlternatives, ...roleAlternatives])).slice(0, 4);
      return { verb: labels.get(canonical) ?? canonical, count, alternatives };
    });
}
