import { getVerbSuggestions } from './verb-bank';
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

  return cleaned[0].toLowerCase();
}

export function findRepetitionIssues(rawText: string, role: UserRole = 'general'): RepetitionIssue[] {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const counts = new Map<string, number>();

  for (const line of lines) {
    const verb = extractLeadVerb(line);
    if (!verb) {
      continue;
    }
    counts.set(verb, (counts.get(verb) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([verb, count]) => {
      const alternatives = getVerbSuggestions(role, undefined, [verb]).slice(0, 4);
      return { verb, count, alternatives };
    });
}
