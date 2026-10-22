export const services = [
  {
    id: 'ai',
    title: 'AI Services',
    category: 'INTELLIGENT ENGINEERING',
    description:
      'Design and development of intelligent solutions that automate workflows, connect business systems, and create meaningful experiences.',
    capabilities: [
      'AI Agents & Assistants',
      'Intelligent Automation',
      'Custom AI Solutions',
    ],
    icon: 'ai',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Services',
    category: 'DIGITAL PROTECTION',
    description:
      'Security assessments, risk analysis, and practical cybersecurity solutions designed around your business priorities.',
    capabilities: [
      'Security Assessments',
      'Risk Analysis',
      'Security Architecture',
    ],
    icon: 'shield',
  },
  {
    id: 'ai-security',
    title: 'AI Security',
    category: 'SECURING INTELLIGENCE',
    description:
      'Evaluate and strengthen the security of AI-powered applications, connected tools, and the data they interact with.',
    capabilities: [
      'AI Application Security',
      'Data & Access Protection',
      'AI Risk Assessment',
    ],
    icon: 'brain',
  },
  {
    id: 'automation',
    title: 'AI-Powered Security Systems',
    category: 'INTELLIGENT DEFENSE',
    description:
      'Develop intelligent security capabilities that support monitoring, anomaly detection, and automated security workflows.',
    capabilities: [
      'Intelligent Monitoring',
      'Anomaly Detection',
      'Security Automation',
    ],
    icon: 'network',
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
