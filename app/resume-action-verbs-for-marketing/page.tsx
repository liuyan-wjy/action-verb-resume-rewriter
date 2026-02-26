import type { Metadata } from 'next';
import { RoleGuidePage } from '@/components/RoleGuidePage';
import { getRoleGuideBySlug } from '@/lib/role-guides';
import { buildPageMetadata } from '@/lib/seo';

const guide = getRoleGuideBySlug('marketing');

export const metadata: Metadata = buildPageMetadata({
  title: 'Resume Action Verbs for Marketing',
  description:
    'Use marketing resume action verbs to communicate campaign execution, channel growth, and measurable business impact.',
  path: '/resume-action-verbs-for-marketing',
  keywords: guide?.secondaryKeywords
});

export default function ResumeActionVerbsForMarketingPage() {
  if (!guide) {
    return null;
  }

  return <RoleGuidePage guide={guide} />;
}
