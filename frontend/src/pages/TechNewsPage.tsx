import { HeroSignal } from '../components/HeroSignal';
import { pages } from '../components/seo/seoData';
import './TechNewsPage.css';

const newsUrl = import.meta.env.VITE_TECH_NEWS_URL?.trim();

export function TechNewsPage() {
  return (
    <section className="tech-news" aria-labelledby="tech-news-title">
      <div className="tech-news-artwork" data-signal-hero="">
        <HeroSignal />
        <div className="tech-news-backdrop" aria-hidden="true" />
        <div className="tech-news-copy">
          <h1 id="tech-news-title" className="tech-news-title" aria-label="Dark Synapses Tech News">
            <span>The</span> News
          </h1>
          <p>{pages['/tech-news'].description}</p>
          {newsUrl ? (
            <a className="tech-news-link" data-public-cta="primary" href={newsUrl}>
              Visit Dark Synapses News
            </a>
          ) : (
            <p className="tech-news-status">News site coming soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}
