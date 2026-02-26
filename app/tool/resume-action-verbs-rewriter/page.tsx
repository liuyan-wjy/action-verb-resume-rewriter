import type { Metadata } from 'next';
import { RewriterPanel } from '@/components/RewriterPanel';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Free Resume Bullet Rewriter Tool (Action Verbs)',
  description:
    'Rewrite one resume bullet into three ATS-friendly action-verb versions. Keep your facts and improve clarity, tone, and impact.',
  path: '/tool/resume-action-verbs-rewriter',
  keywords: ['resume bullet rewriter', 'ats resume rewriter', 'rewrite resume bullet']
});

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
