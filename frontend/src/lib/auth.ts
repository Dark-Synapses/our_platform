export type User = {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
  role: 'client' | 'team' | 'admin';
};

export type RegisterData = {
  full_name: string;
  email: string;
  password: string;
  company_name?: string;
};

export type LoginData = {
  email: string;
  password: string;
};

async function authRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/v1/auth${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : 'Something went wrong. Please try again.',
    );
  }

  return response.json() as Promise<T>;
}

export function register(data: RegisterData): Promise<User> {
  return authRequest<User>('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function login(data: LoginData): Promise<User> {
  return authRequest<User>('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(): Promise<User> {
  return authRequest<User>('/me');
}

export function logout(): Promise<{ message: string }> {
  return authRequest<{ message: string }>('/logout', {
    method: 'POST',
  });
}
