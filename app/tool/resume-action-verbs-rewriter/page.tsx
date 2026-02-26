import type { Metadata } from 'next';
import { RewriterPanel } from '@/components/RewriterPanel';

export const metadata: Metadata = {
  title: 'Resume Bullet Rewriter Tool',
  description: 'Rewrite one resume bullet into three action-verb versions with ATS-friendly structure.'
};

export default function ResumeToolPage() {
  return (
    <div className="stack-xl">
      <section className="card stack-sm">
        <h1>Resume Bullet Rewriter Tool</h1>
        <p>Rewrite weak resume lines into stronger action-verb bullets without changing your original facts.</p>
      </section>
      <RewriterPanel />
    </div>
  );
}
