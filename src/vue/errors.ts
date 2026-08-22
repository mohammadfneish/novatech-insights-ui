/** Best-effort message extraction from an axios-style error, without depending on axios.
 *  Handles Laravel's `{ message }` / `{ errors: { field: [...] } }` envelopes. */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  const res = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response;
  const data = res?.data;
  if (data?.errors) {
    const flat = Object.values(data.errors).flat();
    if (flat.length) return flat.join(' ');
  }
  if (data?.message) return data.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
