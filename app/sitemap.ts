import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

const INDEXABLE_PATHS = [
  '/',
  '/tool/resume-action-verbs-rewriter',
  '/action-verbs-for-resume',
  '/resume-action-verbs',
  '/resume-action-verbs-for-customer-service',
  '/resume-action-verbs-for-project-manager',
  '/resume-action-verbs-for-marketing',
  '/resume-action-verbs-for-sales',
  '/resume-action-verbs-for-product-manager',
  '/resume-action-verbs-for-software-engineer',
  '/action-verb-examples',
  '/pricing',
  '/privacy-policy',
  '/about',
  '/contact'
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return INDEXABLE_PATHS.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path.startsWith('/tool') ? 0.9 : 0.7
  }));
}
