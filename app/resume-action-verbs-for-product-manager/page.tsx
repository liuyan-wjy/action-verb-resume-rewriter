import type { Metadata } from 'next';
import { RoleGuidePage } from '@/components/RoleGuidePage';
import { getRoleGuideBySlug } from '@/lib/role-guides';
import { buildPageMetadata } from '@/lib/seo';

const guide = getRoleGuideBySlug('product-manager');

export const metadata: Metadata = buildPageMetadata({
  title: 'Resume Action Verbs for Product Manager',
  description:
    'Use product manager resume action verbs to show strategy, prioritization, cross-functional alignment, and measurable impact.',
  path: '/resume-action-verbs-for-product-manager',
  keywords: guide?.secondaryKeywords
});

export default function ResumeActionVerbsForProductManagerPage() {
  if (!guide) {
    return null;
  }

  return <RoleGuidePage guide={guide} />;
}
