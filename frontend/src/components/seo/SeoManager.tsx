import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { SITE, BRAND, DEFAULT_IMAGE, pages } from './seoData';

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = value;
}

function setCanonical(url: string | null) {
  let link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );

  if (!url) {
    link?.remove();
    return;
  }

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}

export function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath =
      pathname.replace(/\/+$/, '') || '/';

    const info = pages[normalizedPath];
    const isPublic = Boolean(info);
    const title = info?.title ?? `${BRAND} | Private Page`;
    const description = info?.description ??
      'Dark Synapses account and internal pages.';
    const url = `${SITE}${normalizedPath === '/' ? '/' : normalizedPath}`;

    document.title = title;

    setMeta('name', 'description', description);
    setMeta('name', 'robots', isPublic ? 'index, follow' : 'noindex, nofollow');

    setCanonical(isPublic ? url : null);

    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', BRAND);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', DEFAULT_IMAGE);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', DEFAULT_IMAGE);

    const scriptId = 'dark-synapses-organization-schema';
    document.getElementById(scriptId)?.remove();

    if (normalizedPath === '/') {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: BRAND,
        url: SITE,
        logo: `${SITE}/images/logo.png`,
        description,
      });
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
}
