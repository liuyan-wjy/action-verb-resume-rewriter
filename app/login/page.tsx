import type { Metadata } from 'next';
import { AuthButton } from '@/components/AuthButton';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in with Google to sync credits and purchase history.'
};

export default function LoginPage() {
  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>Sign in to your account</h1>
        <p>Use Google sign-in to save your rewrite usage and manage credits.</p>
        <AuthButton />
      </section>
    </div>
  );
}
