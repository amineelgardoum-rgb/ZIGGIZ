export const API_BASE = 'http://localhost:8080';
const REQUEST_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.error || errorBody?.message || `Request failed with status ${response.status}`;
      throw new ApiError('http', message, response.status);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err?.name === 'AbortError') throw new ApiError('timeout', 'Request timed out');
    throw new ApiError('network', 'Unable to reach the server');
  } finally {
    clearTimeout(timer);
  }
}

export async function submitReservation(data) {
  if (!API_BASE) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { ok: true, simulated: true };
  }

  const payload = {
    service: data.service,
    option: data.option,
    date: data.date,
    time: data.time || null,
    people: Number(data.people),
    name: data.name,
    email: data.email,
    message: data.message || '',
  };

  return request(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function fetchServices() {
  if (!API_BASE) return null;
  return request(`${API_BASE}/api/services`);
}

export async function fetchReviews() {
  if (!API_BASE) return null;
  return request(`${API_BASE}/api/reviews`);
}

export async function submitReview(data) {
  if (!API_BASE) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { ok: true, simulated: true };
  }

  const payload = {
    name: data.name,
    email: data.email,
    quote: data.quote,
    role: data.role || '',
  };

  return request(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
