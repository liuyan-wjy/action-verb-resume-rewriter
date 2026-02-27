import { getWeakPhrasesForRole, isWeakVerb } from './rule-dictionaries';
import { tokenizeWords } from './text-normalize';
import type { UserRole } from './types';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function detectWeakMatches(text: string, role: UserRole = 'general'): string[] {
  const lowered = text.toLowerCase();
  const matches = new Set<string>();
  const weakPhrases = getWeakPhrasesForRole(role);

  for (const phrase of weakPhrases) {
    const pattern = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'i');
    if (pattern.test(lowered)) {
      matches.add(phrase);
    }
  }

  const words = tokenizeWords(lowered);
  for (const word of words) {
    if (isWeakVerb(word, role)) {
      matches.add(word);
    }
  }

  return Array.from(matches).slice(0, 16);
}

export function stripLeadingWeakPhrase(text: string, role: UserRole = 'general'): string {
  const trimmed = text.trim().replace(/^[-*•]\s*/, '');
  const lowered = trimmed.toLowerCase();

  // Prefer longest leading weak phrase first.
  const sorted = [...getWeakPhrasesForRole(role)].sort((a, b) => b.length - a.length);

  for (const phrase of sorted) {
    const pattern = new RegExp(`^${escapeRegExp(phrase)}(?:\\b|\\s|[:,\\-])`, 'i');
    if (pattern.test(lowered)) {
      const stripped = trimmed.slice(phrase.length).trim();
      return stripped.replace(/^[,:\-\s]+/, '') || trimmed;
    }
  }

  return trimmed;
}
