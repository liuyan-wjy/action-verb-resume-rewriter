import type { Metadata } from 'next';
import { RoleGuidePage } from '@/components/RoleGuidePage';
import { getRoleGuideBySlug } from '@/lib/role-guides';
import { buildPageMetadata } from '@/lib/seo';

const guide = getRoleGuideBySlug('software-engineer');

export const metadata: Metadata = buildPageMetadata({
  title: 'Resume Action Verbs for Software Engineer',
  description:
    'Use software engineer resume action verbs to highlight architecture, performance optimization, reliability, and delivery impact.',
  path: '/resume-action-verbs-for-software-engineer',
  keywords: guide?.secondaryKeywords
});

export default function ResumeActionVerbsForSoftwareEngineerPage() {
  if (!guide) {
    return null;
  }

  return <RoleGuidePage guide={guide} />;
}
