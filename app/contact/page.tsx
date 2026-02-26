import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact PowerVerb for support, billing, and partnership inquiries.'
};

export default function ContactPage() {
  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>Contact Us</h1>
        <p>For support, billing, or business inquiries, send us an email.</p>

        <div className="stack-sm">
          <h2>Support email</h2>
          <p>
            <a href="mailto:2471662450@qq.com">2471662450@qq.com</a>
          </p>

          <h2>What to include</h2>
          <p>Include your account email, issue summary, and screenshots when possible.</p>
        </div>
      </section>
    </div>
  );
}
