export type ContactInquiryPayload = {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  website: string;
};

export type ContactInquiryResult = {
  id: string;
  status: 'submitted';
  created_at: string;
};

export async function submitContactInquiry(
  data: ContactInquiryPayload,
): Promise<ContactInquiryResult> {
  const response = await fetch('/api/v1/contact-inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(
      typeof result?.detail === 'string'
        ? result.detail
        : 'Unable to submit your inquiry. Please try again.',
    );
  }

  return response.json() as Promise<ContactInquiryResult>;
}
