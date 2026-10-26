import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE = 'https://www.darksynapses.site';
const BRAND = 'Dark Synapses';
const DEFAULT_IMAGE = `${SITE}/images/hero-cyber.png`;

type SeoInfo = {
  title: string;
  description: string;
};

const pages: Record<string, SeoInfo> = {
  '/': {
    title: 'Dark Synapses | AI & Cybersecurity',
    description:
      'Dark Synapses delivers AI engineering, cybersecurity, AI-powered security systems, and AI security. Where Intelligence Meets Threats.',
  },
  '/about': {
    title: 'About Us | Dark Synapses',
    description:
      'Meet Dark Synapses, an AI and cybersecurity company building intelligent technology and security solutions.',
  },
  '/services': {
    title: 'AI & Cybersecurity Services | Dark Synapses',
    description:
      'Explore AI engineering, cybersecurity, AI-powered security, AI security, and digital forensics services.',
  },
  '/services/ai': {
    title: 'AI Engineering Services | Dark Synapses',
    description:
      'Explore intelligent automation, AI applications, computer vision, and custom AI engineering solutions.',
  },
  '/services/cybersecurity': {
    title: 'Cybersecurity Services | Dark Synapses',
    description:
      'Explore cybersecurity solutions focused on identifying risks, strengthening defenses, and protecting digital systems.',
  },
  '/services/ai-security': {
    title: 'AI Security Services | Dark Synapses',
    description:
      'Explore security solutions for AI applications, models, data, and intelligent systems.',
  },
  '/services/ai-powered-security': {
    title: 'AI-Powered Security Systems | Dark Synapses',
    description:
      'Discover AI-powered cybersecurity systems for intelligent security analysis and threat detection.',
  },
  '/services/content-authenticity-digital-forensics': {
    title: 'Deepfake Detection & Digital Forensics | Dark Synapses',
    description:
      'Explore AI-generated content detection, deepfake analysis, digital evidence, and content authenticity solutions.',
  },
  '/projects': {
    title: 'Our Projects | Dark Synapses',
    description:
      'Explore AI, intelligent automation, cybersecurity, and engineering projects from Dark Synapses.',
  },
  '/contact': {
    title: 'Contact Us | Dark Synapses',
    description:
      'Connect with Dark Synapses to discuss AI engineering, cybersecurity, and intelligent security solutions.',
  },
};

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
