// Reservation API — wire this to your backend later.
//
// Set RESERVATION_ENDPOINT to your booking endpoint, e.g.:
//   const RESERVATION_ENDPOINT = 'https://api.yourdomain.com/reservations';
//
// While it is left blank, submitReservation() simulates a successful
// request so the form keeps working during development.

const RESERVATION_ENDPOINT = '';
const REQUEST_TIMEOUT_MS = 10000;

/** Typed error so the UI can show a specific, translated message. */
export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code; // 'network' | 'timeout' | 'http'
    this.status = status;
  }
}

export async function submitReservation(data) {
  // No endpoint configured yet — simulate a successful request.
  if (!RESERVATION_ENDPOINT) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { ok: true, simulated: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(RESERVATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError('http', `Request failed with status ${response.status}`, response.status);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err?.name === 'AbortError') throw new ApiError('timeout', 'Request timed out');
    throw new ApiError('network', 'Unable to reach the booking service');
  } finally {
    clearTimeout(timer);
  }
}
