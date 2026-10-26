export const SITE = 'https://www.darksynapses.site';
export const BRAND = 'Dark Synapses';
export const DEFAULT_IMAGE = `${SITE}/images/hero-cyber.png`;

export type SeoInfo = {
  title: string;
  description: string;
};

export const pages: Record<string, SeoInfo> = {
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
