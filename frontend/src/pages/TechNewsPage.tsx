import { useState } from 'react';
import './TechNewsPage.css';

const categories = [
  { id: 'AI', image: '/images/news-categories/ai.svg', icon: '◎' },
  { id: 'Cybersecurity', image: '/images/news-categories/cybersecurity.svg', icon: '⬡' },
  { id: 'AI Security', image: '/images/news-categories/ai-security.svg', icon: '▣' },
  { id: 'AI-Powered Security', image: '/images/news-categories/ai-powered-security.svg', icon: '◉' },
  { id: 'Digital Forensics', image: '/images/news-categories/digital-forensics.svg', icon: '⌕' },
] as const;
type Category = (typeof categories)[number]['id'];

export function TechNewsPage() {
  const [selected, setSelected] = useState<Category | null>(null);
  return <main className="ds-news-ref ds-news-v6">
    <section className="ds-news-ref-hero" aria-labelledby="news-title">
      <div className="ds-news-ref-inner">
        <p className="ds-news-ref-kicker">[ DARK SYNAPSES / TECH NEWS ]</p>
        <h1 id="news-title"><span>THE</span><strong>NEW<span>S_</span></strong></h1>
        <p className="ds-news-ref-desc">New releases, tools, and security alerts across AI, cybersecurity, AI security, AI-powered security, and digital forensics.</p>
        <div className="ds-news-ref-signal" aria-hidden="true"><i/><i/><i/><i/></div>
      </div>
    </section>
    <section className="ds-news-ref-content" aria-label="News categories">
      <div className="ds-news-v6-grid">
        {categories.map(category => <button type="button" key={category.id} className={'ds-news-v6-tile' + (selected === category.id ? ' selected' : '')} aria-pressed={selected === category.id} onClick={() => setSelected(selected === category.id ? null : category.id)}>
          <img src={category.image} alt="" loading="lazy"/>
          <span className="ds-news-v6-tile-label"><span aria-hidden="true">{category.icon}</span>{category.id}</span>
        </button>)}
      </div>
      <div className="ds-news-v6-heading"><div><p className="ds-news-ref-kicker">[ FIELD NOTES / DISPATCHES ]</p><h2>Latest intelligence<span>_</span></h2></div><span>UPCOMING ARTICLES</span></div>
      <div className="ds-news-v6-empty" role="status"><span aria-hidden="true">▤</span><p>{selected ? `Editorial coverage for ${selected} is coming soon.` : 'EDITORIAL COVERAGE COMING SOON'}</p></div>
    </section>
  </main>;
}
