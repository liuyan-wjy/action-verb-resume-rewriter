export type Tone = 'leadership' | 'execution' | 'impact';

export type UserRole =
  | 'general'
  | 'engineering'
  | 'product'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'finance';

export type Seniority = 'junior' | 'mid' | 'senior';

export interface RewriteRequest {
  text: string;
  role?: UserRole;
  tone?: Tone;
  seniority?: Seniority;
}

export interface RewriteVariation {
  tone: Tone;
  action_verb: string;
  rewritten_bullet: string;
  why_better: string;
  quantification_hint: string;
}

export interface RewriteResponse {
  variations: RewriteVariation[];
  weakMatches: string[];
  suggestions: string[];
}
