export type Health = { status: 'ok' };

export async function getReadiness(signal: AbortSignal): Promise<Health> {
  const response = await fetch('/api/v1/health/ready', { signal });
  if (!response.ok) throw new Error('The API or database is not ready.');
  return response.json() as Promise<Health>;
}
