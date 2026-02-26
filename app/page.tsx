import Link from 'next/link';
import { RewriterPanel } from '@/components/RewriterPanel';
import { VerbCategoryGrid } from '@/components/VerbCategoryGrid';

export default function HomePage() {
  return (
    <div className="stack-xl">
      <section className="hero card stack-md">
        <p className="eyebrow">Resume Language Booster</p>
        <h1>Stop writing weak bullets. Start with power verbs.</h1>
        <p>
          Convert plain resume statements into stronger, ATS-friendly bullet points in one click. Built for job seekers who need
          better wording without exaggeration.
        </p>
        <div className="hero-links">
          <Link href="/tool/resume-action-verbs-rewriter" className="btn-primary link-btn">
            Open Rewriter Tool
          </Link>
          <Link href="/action-verbs-for-resume" className="btn-secondary link-btn">
            Browse Verb List
          </Link>
        </div>
      </section>

      <RewriterPanel />
      <VerbCategoryGrid />
    </div>
  );
}
