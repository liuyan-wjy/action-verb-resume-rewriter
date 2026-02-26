import type { Tone, UserRole } from './types';

export const roleVerbBank: Record<UserRole, string[]> = {
  general: [
    'Delivered',
    'Executed',
    'Improved',
    'Streamlined',
    'Coordinated',
    'Implemented',
    'Enhanced',
    'Accelerated',
    'Optimized',
    'Resolved'
  ],
  engineering: [
    'Engineered',
    'Built',
    'Refactored',
    'Optimized',
    'Automated',
    'Deployed',
    'Scaled',
    'Debugged',
    'Hardened',
    'Integrated'
  ],
  product: [
    'Defined',
    'Prioritized',
    'Launched',
    'Validated',
    'Drove',
    'Synthesized',
    'Scoped',
    'Facilitated',
    'Aligned',
    'Improved'
  ],
  marketing: [
    'Positioned',
    'Launched',
    'Scaled',
    'Segmented',
    'Produced',
    'Executed',
    'Increased',
    'Optimized',
    'Orchestrated',
    'Amplified'
  ],
  sales: [
    'Prospected',
    'Negotiated',
    'Closed',
    'Expanded',
    'Exceeded',
    'Retained',
    'Built',
    'Accelerated',
    'Generated',
    'Converted'
  ],
  operations: [
    'Standardized',
    'Reduced',
    'Improved',
    'Coordinated',
    'Streamlined',
    'Implemented',
    'Audited',
    'Enforced',
    'Monitored',
    'Stabilized'
  ],
  finance: [
    'Analyzed',
    'Forecasted',
    'Modeled',
    'Reconciled',
    'Reduced',
    'Improved',
    'Optimized',
    'Evaluated',
    'Delivered',
    'Reported'
  ]
};

const tonePreference: Record<Tone, string[]> = {
  leadership: ['Led', 'Spearheaded', 'Directed', 'Mentored', 'Orchestrated'],
  execution: ['Executed', 'Implemented', 'Delivered', 'Coordinated', 'Optimized'],
  impact: ['Increased', 'Reduced', 'Improved', 'Accelerated', 'Boosted']
};

export function getVerbSuggestions(role: UserRole = 'general', tone?: Tone, exclude: string[] = []): string[] {
  const base = [...roleVerbBank[role]];
  const toneVerbs = tone ? tonePreference[tone] : [];
  const merged = [...toneVerbs, ...base];
  const excluded = new Set(exclude.map((word) => word.toLowerCase()));

  return merged.filter((verb) => !excluded.has(verb.toLowerCase())).slice(0, 8);
}

export const seoVerbCategories: Record<string, string[]> = {
  Leadership: ['Led', 'Spearheaded', 'Directed', 'Mentored', 'Orchestrated', 'Championed', 'Mobilized', 'Unified'],
  Analysis: ['Analyzed', 'Diagnosed', 'Evaluated', 'Assessed', 'Quantified', 'Modeled', 'Validated', 'Interpreted'],
  Sales: ['Prospected', 'Negotiated', 'Closed', 'Expanded', 'Converted', 'Retained', 'Revived', 'Exceeded'],
  Operations: ['Streamlined', 'Standardized', 'Automated', 'Reduced', 'Stabilized', 'Monitored', 'Enforced', 'Coordinated'],
  Engineering: ['Engineered', 'Built', 'Refactored', 'Optimized', 'Deployed', 'Scaled', 'Integrated', 'Hardened']
};
