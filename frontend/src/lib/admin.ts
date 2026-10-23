export type RequestStatus =
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected';

export interface AdminServiceRequest {
  id: string;
  service_type: string;
  title: string;
  description: string;
  status: RequestStatus;
  created_at: string;
}

async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
}

export function getAdminRequests() {
  return api<AdminServiceRequest[]>(
    '/api/v1/admin/service-requests',
  );
}

export function updateRequestStatus(
  id: string,
  status: RequestStatus,
) {
  return api<AdminServiceRequest>(
    `/api/v1/admin/service-requests/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
}

export interface AdminCustomer {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
}

export interface RequestHistoryEvent {
  id: string;
  previous_status: string | null;
  new_status: string;
  admin_id: string;
  created_at: string;
}

export interface AdminRequestDetails {
  request: AdminServiceRequest;
  client: AdminCustomer | null;
  history: RequestHistoryEvent[];
}

export function getAdminRequestDetails(id: string) {
  return api<AdminRequestDetails>(
    `/api/v1/admin/service-requests/${encodeURIComponent(id)}`,
  );
}
