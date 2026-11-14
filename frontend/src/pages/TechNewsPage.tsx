import { UiIcon } from '../components/UiIcons';
import { pages } from '../components/seo/seoData';
import './TechNewsPage.css';

const newsUrl = import.meta.env.VITE_TECH_NEWS_URL?.trim();

export function TechNewsPage() {
  return (
    <section className="tech-news" aria-labelledby="tech-news-title">
      <div className="tech-news-artwork">
        <h1 id="tech-news-title" className="tech-news-title">Tech News</h1>
        <div className="tech-news-copy">
          <p>{pages['/tech-news'].description}</p>
          {newsUrl ? (
            <a className="tech-news-link" href={newsUrl}>
              Visit Dark Synapses News <UiIcon name="arrow" />
            </a>
          ) : (
            <p className="tech-news-status">News site coming soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}
