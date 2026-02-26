import type { Metadata } from 'next';
import { RoleGuidePage } from '@/components/RoleGuidePage';
import { getRoleGuideBySlug } from '@/lib/role-guides';
import { buildPageMetadata } from '@/lib/seo';

const guide = getRoleGuideBySlug('customer-service');

export const metadata: Metadata = buildPageMetadata({
  title: 'Resume Action Verbs for Customer Service',
  description:
    'Use customer service resume action verbs to highlight issue resolution, escalation handling, and customer impact.',
  path: '/resume-action-verbs-for-customer-service',
  keywords: guide?.secondaryKeywords
});

export default function ResumeActionVerbsForCustomerServicePage() {
  if (!guide) {
    return null;
  }

  return <RoleGuidePage guide={guide} />;
}
