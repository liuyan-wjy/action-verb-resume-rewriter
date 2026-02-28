'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { findRepetitionIssues } from '@/lib/repetition';
import { trackEvent } from '@/lib/analytics';
import type { RewriteVariation, UserRole, Tone, Seniority } from '@/lib/types';

interface RewriteApiResponse {
  variations: RewriteVariation[];
  weakMatches: string[];
  suggestions: string[];
}

interface RewriteHistoryItem {
  id: string;
  input: string;
  variations: RewriteVariation[];
  createdAt: string;
}

interface UserQuotaResponse {
  quota: {
    date: string;
    dailyLimit: number;
    dailyUsed: number;
    dailyRemaining: number;
  };
}

const roles: Array<{ label: string; value: UserRole }> = [
  { label: 'General', value: 'general' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Product', value: 'product' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Operations', value: 'operations' },
  { label: 'Finance', value: 'finance' }
];

const tones: Array<{ label: string; value: Tone }> = [
  { label: 'Leadership', value: 'leadership' },
  { label: 'Execution', value: 'execution' },
  { label: 'Impact', value: 'impact' }
];

const seniorityLevels: Array<{ label: string; value: Seniority }> = [
  { label: 'Junior', value: 'junior' },
  { label: 'Mid', value: 'mid' },
  { label: 'Senior', value: 'senior' }
];

const HISTORY_KEY = 'pwrv_history';
const LEAD_SUBMITTED_KEY = 'pwrv_lead_submitted';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RewriterPanel() {
  const [text, setText] = useState('Responsible for managing a team of 5 support specialists across escalations.');
  const [role, setRole] = useState<UserRole>('general');
  const [tone, setTone] = useState<Tone>('execution');
  const [seniority, setSeniority] = useState<Seniority>('mid');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteApiResponse | null>(null);
  const [history, setHistory] = useState<RewriteHistoryItem[]>([]);
  const rewriteCountRef = useRef(0);
  const [dailyQuota, setDailyQuota] = useState<UserQuotaResponse['quota'] | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  const [showLead, setShowLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const [repetitionInput, setRepetitionInput] = useState('');

  async function refreshDailyQuota() {
    setQuotaLoading(true);
    try {
      const response = await fetch('/api/user/me', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setDailyQuota(null);
        }
        return;
      }

      const data = (await response.json()) as UserQuotaResponse;
      setDailyQuota(data.quota);
    } catch {
      setDailyQuota(null);
    } finally {
      setQuotaLoading(false);
    }
  }

  useEffect(() => {
    trackEvent('page_view', { path: window.location.pathname });

    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RewriteHistoryItem[];
        setHistory(parsed);
      } catch {
        setHistory([]);
      }
    }

    const leadState = window.localStorage.getItem(LEAD_SUBMITTED_KEY) === 'true';
    setLeadSubmitted(leadState);
    void refreshDailyQuota();
  }, []);

  const repetitionIssues = useMemo(() => findRepetitionIssues(repetitionInput, role), [repetitionInput, role]);

  async function handleRewrite() {
    const input = text.trim();
    if (input.length < 6) {
      setError('Please enter at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    trackEvent('rewrite_submit', { role, tone, seniority, length: input.length });

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: input, role, tone, seniority })
      });

      const data = (await response.json()) as RewriteApiResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Rewrite failed');
      }

      setResult(data);
      void refreshDailyQuota();

      const item: RewriteHistoryItem = {
        id: `${Date.now()}`,
        input,
        variations: data.variations,
        createdAt: new Date().toISOString()
      };

      const nextHistory = [item, ...history].slice(0, 5);
      setHistory(nextHistory);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));

      rewriteCountRef.current += 1;
      if (rewriteCountRef.current >= 2 && !leadSubmitted) {
        setShowLead(true);
        trackEvent('lead_popup_view', { trigger: 'rewrite_count', count: rewriteCountRef.current });
      }

      trackEvent('rewrite_success', { variations: data.variations.length });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unknown rewrite error';
      setError(message);
      trackEvent('rewrite_fail', { message });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(textToCopy: string) {
    await navigator.clipboard.writeText(textToCopy);
    trackEvent('copy_click', { size: textToCopy.length });
  }

  function applyHistoryItem(item: RewriteHistoryItem) {
    setText(item.input);
    setResult({
      variations: item.variations,
      weakMatches: [],
      suggestions: []
    });
  }

  async function submitLead() {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, source: 'rewriter_modal' })
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? 'Lead submission failed.');
      }

      trackEvent('lead_submit', { email_domain: email.split('@')[1] ?? 'unknown' });
      setLeadSubmitted(true);
      setShowLead(false);
      window.localStorage.setItem(LEAD_SUBMITTED_KEY, 'true');
      setError(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Lead submission failed.');
    }
  }

  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <div className="stack-sm">
          <h2>Action Verb Resume Rewriter</h2>
          <p>
            Paste one resume bullet. Get 3 stronger ATS-friendly rewrites without inventing facts.
          </p>
          {dailyQuota ? (
            <div className={`quota-bar${dailyQuota.dailyRemaining <= 2 ? ' quota-bar-low' : ''}`}>
              <span>
                <strong>Daily free quota ({dailyQuota.date}):</strong> {dailyQuota.dailyUsed}/{dailyQuota.dailyLimit} used
                {' · '}
                {dailyQuota.dailyRemaining} left
              </span>
              {dailyQuota.dailyRemaining <= 2 ? (
                <Link href="/pricing" className="quota-upgrade-link">
                  Upgrade
                </Link>
              ) : null}
            </div>
          ) : quotaLoading ? (
            <p className="hint">Checking daily quota...</p>
          ) : null}
        </div>

        <label className="field-label" htmlFor="resume-bullet">
          Your bullet point
        </label>
        <textarea
          id="resume-bullet"
          className="input"
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Example: Responsible for improving onboarding and handling customer escalations."
        />

        <div className="select-grid">
          <label>
            Role
            <select className="select" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              {roles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tone
            <select className="select" value={tone} onChange={(event) => setTone(event.target.value as Tone)}>
              {tones.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Seniority
            <select className="select" value={seniority} onChange={(event) => setSeniority(event.target.value as Seniority)}>
              {seniorityLevels.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="btn-primary" onClick={handleRewrite} disabled={loading}>
          {loading ? 'Rewriting...' : 'Rewrite Bullet'}
        </button>

        {error ? <p className="error-text">{error}</p> : null}

        {result ? (
          <div className="stack-md">
            {result.weakMatches.length > 0 ? (
              <div className="notice">
                <strong>Weak wording detected:</strong> {result.weakMatches.join(', ')}
              </div>
            ) : null}

            {result.suggestions.length > 0 ? (
              <div className="notice">
                <strong>Suggested action verbs:</strong> {result.suggestions.join(', ')}
              </div>
            ) : null}

            <div className="stack-sm">
              {result.variations.map((variation, index) => (
                <article key={`${variation.tone}-${index}`} className="mini-card">
                  <div className="tone-row">
                    <span className="tone-pill">{variation.tone}</span>
                    <span className="tone-verb">{variation.action_verb}</span>
                  </div>
                  <p className="rewrite-line">{variation.rewritten_bullet}</p>
                  <p>{variation.why_better}</p>
                  <p className="hint">{variation.quantification_hint}</p>
                  <button className="btn-secondary" onClick={() => handleCopy(variation.rewritten_bullet)}>
                    Copy
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="card stack-md">
        <h2>Repetition Checker</h2>
        <p>Paste multiple bullet points. We will flag repeated lead verbs and suggest alternatives.</p>
        <textarea
          className="input"
          rows={5}
          placeholder="Led sprint planning for 2 teams\nLed backlog grooming for cross-functional stakeholders\nOptimized release handoffs"
          value={repetitionInput}
          onChange={(event) => setRepetitionInput(event.target.value)}
        />

        {repetitionInput.trim().length > 0 ? (
          repetitionIssues.length > 0 ? (
            <div className="stack-sm">
              {repetitionIssues.map((issue) => (
                <article key={issue.verb} className="mini-card">
                  <p>
                    <strong>{issue.verb}</strong> appears {issue.count} times.
                  </p>
                  <p>Try: {issue.alternatives.join(', ')}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="notice">No repeated lead verbs detected.</div>
          )
        ) : null}
      </section>

      <section className="card stack-md">
        <h2>Recent Rewrites</h2>
        {history.length === 0 ? (
          <p>No history yet. Your recent rewrites will appear here.</p>
        ) : (
          <div className="stack-sm">
            {history.map((item) => (
              <article key={item.id} className="mini-card">
                <p className="history-input">{item.input}</p>
                <button className="btn-secondary" onClick={() => applyHistoryItem(item)}>
                  Reuse Output
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {showLead ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="lead-title">
          <div className="modal-card stack-sm">
            <h2 id="lead-title">Get the 20 Resume Power Verbs Pack</h2>
            <p>Drop your email to unlock the bonus list and weekly rewrite tips.</p>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            <div className="modal-actions">
              <button className="btn-primary" onClick={submitLead}>
                Unlock Pack
              </button>
              <button className="btn-secondary" onClick={() => setShowLead(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
