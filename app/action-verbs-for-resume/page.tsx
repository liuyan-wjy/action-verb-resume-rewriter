import type { Metadata } from 'next';
import Link from 'next/link';
import { VerbCategoryGrid } from '@/components/VerbCategoryGrid';

export const metadata: Metadata = {
  title: 'Action Verbs for Resume',
  description: 'A categorized list of action verbs for resume bullet points, plus usage guidance and examples.'
};

export default function ActionVerbsForResumePage() {
  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>Action Verbs for Resume</h1>
        <p>
          Use this list when you need stronger opening words than “responsible for” or “helped”. Pick verbs that match your role,
          then back them with clear scope and outcomes.
        </p>
        <p>
          Need instant rewrites? Use the <Link href="/tool/resume-action-verbs-rewriter">Action Verb Resume Rewriter tool</Link>.
        </p>
      </section>
      <VerbCategoryGrid />
    </div>
  );
}
