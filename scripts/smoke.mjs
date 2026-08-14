const baseURL = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
for (const path of ['/api/health', '/', '/scenario', '/analytics']) {
  const response = await fetch(`${baseURL}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  console.log(`PASS ${path} ${response.status}`);
}
