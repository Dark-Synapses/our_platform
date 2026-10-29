import fs from 'node:fs';
import path from 'node:path';

import { SITE, BRAND, DEFAULT_IMAGE, pages } from '../src/components/seo/seoData.ts';

const IMAGE = DEFAULT_IMAGE;

const dist = path.resolve('dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

for (const [route, { title, description }] of Object.entries(pages)) {
  const url = SITE + route;
  const tags = [
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    `<meta name="robots" content="index, follow">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escapeHtml(BRAND)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:image" content="${IMAGE}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:image" content="${IMAGE}">`,
  ].join('\n    ');

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}">`)
    .replace('</head>', `    ${tags}\n  </head>`);

  if (route === '/') {
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Dark Synapses',
      url: SITE,
      logo: `${SITE}/images/logo.png`,
    })}</script>\n  </head>`);
  }

  const target = route === '/'
    ? path.join(dist, 'index.html')
    : path.join(dist, route.slice(1), 'index.html');

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  console.log(`Generated ${route}`);
}
