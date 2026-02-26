import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';

export function NavBar() {
  return (
    <header className="nav-wrap">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          PowerVerb
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/tool/resume-action-verbs-rewriter">Tool</Link>
          <Link href="/action-verbs-for-resume">Verb List</Link>
          <Link href="/action-verb-examples">Examples</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <AuthButton />
      </div>
    </header>
  );
}
