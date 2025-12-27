// Helper function để gọi API với authentication header
export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return {};
  
  try {
    const user = JSON.parse(userStr);
    return {
      'x-user-id': user.id || user._id,
    };
  } catch {
    return {};
  }
}

// Fetch wrapper với authentication
export async function authFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
