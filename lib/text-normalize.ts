const IRREGULAR_VERB_ROOTS: Record<string, string> = {
  ran: 'run',
  run: 'run',
  done: 'do',
  did: 'do',
  does: 'do',
  went: 'go',
  gone: 'go',
  built: 'build',
  bought: 'buy',
  brought: 'bring',
  led: 'lead',
  read: 'read',
  wrote: 'write',
  written: 'write',
  drove: 'drive',
  driven: 'drive',
  spoke: 'speak',
  spoken: 'speak',
  gave: 'give',
  given: 'give',
  made: 'make',
  took: 'take',
  taken: 'take',
  thought: 'think',
  taught: 'teach',
  found: 'find',
  sold: 'sell',
  kept: 'keep',
  met: 'meet',
  won: 'win',
  grew: 'grow',
  grown: 'grow',
  began: 'begin',
  begun: 'begin',
  chose: 'choose',
  chosen: 'choose'
};

function isVowel(char: string) {
  return /^[aeiou]$/.test(char);
}

export function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z]/g, '');
}

export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .map((token) => normalizeToken(token))
    .filter(Boolean);
}

export function toVerbRoot(token: string): string {
  const word = normalizeToken(token);
  if (!word) return '';
  if (IRREGULAR_VERB_ROOTS[word]) return IRREGULAR_VERB_ROOTS[word];

  if (word.endsWith('ied') && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }
  if (word.endsWith('ies') && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.endsWith('ing') && word.length > 5) {
    let stem = word.slice(0, -3);
    if (stem.length > 3 && stem.at(-1) === stem.at(-2) && !isVowel(stem.at(-1) ?? '')) {
      stem = stem.slice(0, -1);
    }
    if (/(at|ag|iz|ur|ov)$/.test(stem)) {
      return `${stem}e`;
    }
    return stem;
  }

  if (word.endsWith('ed') && word.length > 4) {
    let stem = word.slice(0, -2);
    if (stem.endsWith('i')) {
      return `${stem.slice(0, -1)}y`;
    }
    if (stem.length > 3 && stem.at(-1) === stem.at(-2) && !isVowel(stem.at(-1) ?? '')) {
      stem = stem.slice(0, -1);
    }
    if (/(at|ag|iz|ur|ov)$/.test(stem)) {
      return `${stem}e`;
    }
    return stem;
  }

  if (/(ches|shes|sses|xes|zes|oes)$/.test(word) && word.length > 4) {
    return word.slice(0, -2);
  }

  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
    return word.slice(0, -1);
  }

  return word;
}
