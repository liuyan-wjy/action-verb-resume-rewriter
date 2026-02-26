const WEAK_PHRASES = [
  'responsible for',
  'worked on',
  'helped',
  'assisted with',
  'did',
  'handled',
  'participated in',
  'tasked with',
  'in charge of',
  'was involved in'
];

const WEAK_WORDS = ['helped', 'did', 'made', 'used', 'worked', 'handled'];

export function detectWeakMatches(text: string): string[] {
  const lowered = text.toLowerCase();
  const matches = new Set<string>();

  for (const phrase of WEAK_PHRASES) {
    if (lowered.includes(phrase)) {
      matches.add(phrase);
    }
  }

  const words = lowered.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (WEAK_WORDS.includes(word)) {
      matches.add(word);
    }
  }

  return Array.from(matches);
}

export function stripLeadingWeakPhrase(text: string): string {
  const trimmed = text.trim().replace(/^[-*•]\s*/, '');
  const lowered = trimmed.toLowerCase();

  for (const phrase of WEAK_PHRASES) {
    if (lowered.startsWith(phrase)) {
      const stripped = trimmed.slice(phrase.length).trim();
      return stripped.replace(/^[,:\-\s]+/, '') || trimmed;
    }
  }

  return trimmed;
}
