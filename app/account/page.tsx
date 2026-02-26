import type { Metadata } from 'next';
import { AccountClient } from '@/app/account/account-client';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Account',
  description: 'Manage your credits and usage.',
  path: '/account',
  noIndex: true
});

export default function AccountPage() {
  return <AccountClient />;
}
