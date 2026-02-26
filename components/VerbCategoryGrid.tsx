import { seoVerbCategories } from '@/lib/verb-bank';

export function VerbCategoryGrid() {
  return (
    <section className="card stack-lg">
      <h2>Action Verb Bank by Category</h2>
      <div className="verb-grid">
        {Object.entries(seoVerbCategories).map(([category, verbs]) => (
          <article key={category} className="mini-card">
            <h3>{category}</h3>
            <p>{verbs.join(' · ')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
