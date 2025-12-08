// Handle JWT expiration - redirect to login if token is invalid
const handleAuthError = (status) => {
  if (typeof window !== 'undefined' && (status === 401 || status === 403)) {
    // Check if the error is due to token expiration
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode token to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token has expired - clear and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return true;
        }
      } catch (e) {
        // Invalid token format - clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return true;
      }
    }
  }
  return false;
};

export async function getData(path) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${baseUrl}${path}`, {
    headers,
    cache: 'no-store'
  });
  
  if (!res.ok) {
    // Handle auth errors - redirect to login if token expired
    if (handleAuthError(res.status)) {
      throw new Error('Session expired. Redirecting to login...');
    }
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function postData(path, data) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    // Handle auth errors - redirect to login if token expired
    if (handleAuthError(res.status)) {
      throw new Error('Session expired. Redirecting to login...');
    }
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  
  return res.json();
}

export async function updateLogStatus(logId, status) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${baseUrl}/api/logs/${logId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });
  
  if (!res.ok) {
    // Handle auth errors - redirect to login if token expired
    if (handleAuthError(res.status)) {
      throw new Error('Session expired. Redirecting to login...');
    }
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  
  return res.json();
}

// Check if token is expired (can be called periodically)
export function isTokenExpired() {
  if (typeof window === 'undefined') return true;
  
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}