// Helper function để gọi API với authentication header
export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return {};
  
  try {
    const user = JSON.parse(userStr);
    // Try to get ID in order of preference: _id, id
    const userId = user._id || user.id;
    if (!userId) return {};
    
    return {
      'x-user-id': userId.toString(),
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
