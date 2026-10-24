export const services = [
  {
    id: 'ai',
    path: '/services/ai',
    title: 'AI Services',
    category: 'INTELLIGENT ENGINEERING',
    description:
      'AI Software Development،AI Agents،Chatbots & Voice Agents، RAG & Knowledge Assistants، Workflow Automation، Computer Vision، NLP،AI Integration.',
    capabilities: [
      'AI Agents & Assistants',
      'Intelligent Automation',
      'Custom AI Solutions',
    ],
    icon: 'ai',
  },
  {
    id: 'cybersecurity',
    path: '/services/cybersecurity',
    title: 'Cybersecurity Services',
    category: 'DIGITAL PROTECTION',
    description:
      'Security Assessments,Penetration Testing،Vulnerability Assessment، Web & API Security Testing، Security Consulting،Security Hardening.',
    capabilities: [
      'Security Assessments',
      'Penetration Testing',
      'Security Architecture',
    ],
    icon: 'shield',
  },
  {
    id: 'ai-security',
    path: '/services/ai-security',
    title: 'AI Security',
    category: 'SECURING INTELLIGENCE',
    description:
      'AI Application Security،LLM Security Assessments،Prompt Injection Testing،RAG Security، AI Risk Assessment، Security Testing for AI Integrations.',
    capabilities: [
      'AI Application Security',
      'Data & Access Protection',
      'AI Penetration Testing',
    ],
    icon: 'brain',
  },
  {
    id: 'ai-powered-security',
    path: '/services/ai-powered-security',
    title: 'AI-Powered Security Systems',
    category: 'INTELLIGENT DEFENSE',
    description:
      'Intelligent Threat Detection، Automated Security Analysis، AI-Assisted Monitoring، Security Workflow Automation، Custom Security Intelligence Tools.',
    capabilities: [
      'Intelligent Monitoring',
      'Anomaly Detection',
      'Security Automation',
    ],
    icon: 'network',
  },
  {
    id: 'content-forensics',
    path: '/services/content-forensics',
    title: 'AI Content Authenticity & Digital Forensics',
    category: 'DIGITAL CONTENT AUTHENTICITY',
    description:
      'AI-powered detection and digital forensic analysis of synthetic or manipulated images, videos, audio, and text, including deepfakes and voice cloning, to help organizations assess content authenticity and identify potential digital threats.',
    capabilities: [
      'Deepfake Detection',
      'Synthetic Media Analysis',
      'Digital Forensics',
    ],
    icon: 'forensics',
  },
] as const;

export const deliverySteps = [
  {
    title: 'Understand',
    description: 'Define the problem, context, and constraints.',
  },
  {
    title: 'Plan',
    description: 'Agree on scope, start and end dates, and milestones.',
  },
  {
    title: 'Build & Review',
    description: 'Review progress, validate outcomes, and refine the solution.',
  },
  {
    title: 'Handover',
    description: 'Review deliverables and document the result.',
  },
];
