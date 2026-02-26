import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Action Verb Examples',
  description: 'Before and after action verb examples for resume bullets across common job functions.'
};

const examples = [
  {
    before: 'Responsible for onboarding new clients.',
    after: 'Streamlined client onboarding workflows for new accounts, reducing setup friction during handoff.'
  },
  {
    before: 'Helped with weekly reporting.',
    after: 'Produced weekly performance reports that surfaced delivery risks early for leadership review.'
  },
  {
    before: 'Worked on bug fixes for the app.',
    after: 'Resolved high-impact application defects and improved release stability across critical flows.'
  },
  {
    before: 'Did social media posts.',
    after: 'Executed channel-specific social content plans that improved consistency and campaign reach.'
  }
];

export default function ActionVerbExamplesPage() {
  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>Action Verb Examples for Resume Bullets</h1>
        <p>
          Use these examples to upgrade weak phrasing. Keep the facts, strengthen the verb, and surface impact.
        </p>
      </section>

      <section className="card stack-md">
        {examples.map((item, index) => (
          <article key={index} className="mini-card stack-sm">
            <p>
              <strong>Before:</strong> {item.before}
            </p>
            <p>
              <strong>After:</strong> {item.after}
            </p>
          </article>
        ))}
      </section>

      <section className="card stack-md">
        <p>
          Need custom rewrites for your role? <Link href="/tool/resume-action-verbs-rewriter">Try the tool</Link>.
        </p>
      </section>
    </div>
  );
}
