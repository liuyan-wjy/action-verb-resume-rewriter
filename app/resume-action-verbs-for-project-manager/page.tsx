import type { Metadata } from 'next';
import { RoleGuidePage } from '@/components/RoleGuidePage';
import { getRoleGuideBySlug } from '@/lib/role-guides';
import { buildPageMetadata } from '@/lib/seo';

const guide = getRoleGuideBySlug('project-manager');

export const metadata: Metadata = buildPageMetadata({
  title: 'Resume Action Verbs for Project Manager',
  description:
    'Use project manager resume action verbs to show planning, stakeholder alignment, execution control, and delivery impact.',
  path: '/resume-action-verbs-for-project-manager',
  keywords: guide?.secondaryKeywords
});

export default function ResumeActionVerbsForProjectManagerPage() {
  if (!guide) {
    return null;
  }

  return <RoleGuidePage guide={guide} />;
}
