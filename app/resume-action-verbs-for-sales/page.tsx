import type { Metadata } from 'next';
import { RoleGuidePage } from '@/components/RoleGuidePage';
import { getRoleGuideBySlug } from '@/lib/role-guides';
import { buildPageMetadata } from '@/lib/seo';

const guide = getRoleGuideBySlug('sales');

export const metadata: Metadata = buildPageMetadata({
  title: 'Resume Action Verbs for Sales',
  description:
    'Use sales resume action verbs to highlight pipeline generation, deal progression, account expansion, and revenue impact.',
  path: '/resume-action-verbs-for-sales',
  keywords: guide?.secondaryKeywords
});

export default function ResumeActionVerbsForSalesPage() {
  if (!guide) {
    return null;
  }

  return <RoleGuidePage guide={guide} />;
}
