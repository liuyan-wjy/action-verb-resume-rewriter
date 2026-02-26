import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about PowerVerb and our mission.'
};

export default function AboutPage() {
  return (
    <div className="stack-xl">
      <section className="card stack-md">
        <h1>About PowerVerb</h1>
        <p>
          PowerVerb is an AI-assisted resume bullet rewriter focused on stronger action verbs, clearer ATS phrasing,
          and practical quantification hints.
        </p>

        <div className="stack-sm">
          <h2>Our mission</h2>
          <p>Help job seekers turn weak bullet points into concise, credible, and impactful resume language.</p>

          <h2>What makes us different</h2>
          <p>
            We emphasize factual fidelity. The tool is designed to preserve user facts, avoid fabricated achievements,
            and give copy-ready alternatives.
          </p>

          <h2>Reach us</h2>
          <p>
            Email: <a href="mailto:2471662450@qq.com">2471662450@qq.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
