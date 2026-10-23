import { useEffect, useState } from 'react';
import { getReadiness } from '../lib/api';

type Status = 'checking' | 'ready' | 'unavailable';

export function SystemPage() {
  const [status, setStatus] = useState<Status>('checking');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getReadiness(controller.signal).then(() => setStatus('ready')).catch(() => {
      if (!controller.signal.aborted) setStatus('unavailable');
    });
    return () => controller.abort();
  }, [attempt]);
  const messages = {
    checking: 'Checking the API and database connection…',
    ready: 'Frontend → FastAPI → MongoDB: connected.',
    unavailable: 'Cannot reach a ready API. Check Docker Compose logs and retry.',
  };
  return <section className="section system"><p className="eyebrow">Development check</p><h1>One foundation.<br /><span>Three services.</span></h1><p role="status" aria-live="polite">{messages[status]}</p><button className="button" disabled={status === 'checking'} onClick={() => { setStatus('checking'); setAttempt(value => value + 1); }}>Check again</button></section>;
}
