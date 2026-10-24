import type { ReactNode } from 'react';

type IconName = 'arrow' | 'engineering' | 'security' | 'innovation' | 'mail';

const paths: Record<IconName, ReactNode> = {
  arrow: <><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>,
  engineering: <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m9 12 2 2 4-4"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3"/></>,
  security: <><path d="M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/></>,
  innovation: <><path d="M9 18h6M10 22h4"/><path d="M8 15c-1.4-1.2-2-2.8-2-4a6 6 0 0 1 12 0c0 1.2-.6 2.8-2 4-.7.7-1 1.3-1 3H9c0-1.7-.3-2.3-1-3Z"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
};

export function UiIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ display: 'inline-block', flexShrink: 0, verticalAlign: '-0.15em' }}>{paths[name]}</svg>;
}
