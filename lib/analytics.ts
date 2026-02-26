export async function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, payload })
    });
  } catch {
    // Non-blocking analytics.
  }
}
