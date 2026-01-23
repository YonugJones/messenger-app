const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    credentials: 'include',
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => null) : null
    const message =
      body?.error?.message ?? `Request failed: ${res.status} ${res.statusText}`
    throw new Error(message)
  }

  return (isJson ? res.json() : (null as unknown)) as T
}
