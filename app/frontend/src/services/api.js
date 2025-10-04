export async function getData(path) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}
