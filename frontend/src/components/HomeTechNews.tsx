import '../styles/ds-home-tech-news.css';

const newsUrl = (import.meta.env.VITE_TECH_NEWS_URL || '').trim();
const validUrl = (() => {
  try { return ['https:', 'http:'].includes(new URL(newsUrl).protocol); }
  catch { return false; }
})();

export function HomeTechNews() {
  return (
    <section className="ds-home-news" id="tech-news" aria-labelledby="ds-home-news-title">
      <div className="ds-home-news-visual" aria-hidden="true">
        <img src="/images/news-preview/tech-news-retro-reference.webp" alt="" loading="lazy" />
      </div>
      <div className="ds-home-news-copy">
        <p className="ds-home-news-kicker">&gt; DARK SYNAPSES</p>
        <h2 id="ds-home-news-title">Tech News <span className="ds-home-news-external" aria-hidden="true">↗</span></h2>
        <p>Latest insights, analysis, and updates in AI, cybersecurity, AI security, and digital forensics.</p>
        <div className="ds-home-news-actions">
          <a
          className="ds-home-news-cta"
          href={validUrl ? newsUrl : "http://localhost:5174/"}
          target="_blank"
          rel="noopener noreferrer"
        >
          [ Explore Tech News ]
        </a>
          <small>{validUrl ? '↗ Opens in a new website' : 'Independent news website launching soon'}</small>
        </div>
      </div>
      <span className="ds-home-news-deco ds-home-news-deco-top" aria-hidden="true">▪ ▪▪▪▪▪▪ ▪▪ ▪</span>
      <span className="ds-home-news-deco ds-home-news-deco-bottom" aria-hidden="true">▪▪ ▪▪▪▪▪ ▪</span>
    </section>
  );
}
