export type ServiceType =
  | 'ai_services'
  | 'cybersecurity'
  | 'ai_security'
  | 'ai_powered_security';

export type ServiceRequest = {
  id: string;
  service_type: ServiceType;
  title: string;
  description: string;
  status: 'submitted' | 'in_review' | 'approved' | 'rejected';
  created_at: string;
};

export type NewServiceRequest = {
  service_type: ServiceType;
  title: string;
  description: string;
};

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const response = await fetch('/api/v1/service-requests', {
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error('Unable to load service requests.');
  }

  return response.json() as Promise<ServiceRequest[]>;
}

export async function createServiceRequest(
  data: NewServiceRequest,
): Promise<ServiceRequest> {
  const response = await fetch('/api/v1/service-requests', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(
      typeof result?.detail === 'string'
        ? result.detail
        : 'Unable to submit service request.',
    );
  }

  return response.json() as Promise<ServiceRequest>;
}
