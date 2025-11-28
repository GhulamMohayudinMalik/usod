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
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  
  return res.json();
}