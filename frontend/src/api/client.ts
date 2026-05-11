const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://clinica-turnos-api.onrender.com';
const REQUEST_TIMEOUT_MS = 12000;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    signal: controller.signal,
    ...options,
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('La API no respondió a tiempo. Verifica que el backend esté activo.');
    }
    throw error;
  }).finally(() => window.clearTimeout(timeoutId));

  if (!res.ok) {
    const error = await res.json().catch(() => ({ mensaje: 'Error desconocido' }));
    throw new Error(error.mensaje ?? error.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
