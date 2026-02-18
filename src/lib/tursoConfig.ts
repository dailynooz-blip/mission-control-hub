/**
 * Turso credential manager
 * Priority: localStorage (runtime) → import.meta.env (build-time)
 * This lets credentials be hot-swapped without a rebuild.
 */

const LS_URL_KEY = "turso_url";
const LS_TOKEN_KEY = "turso_token";

export function getTursoUrl(): string | undefined {
  return (
    localStorage.getItem(LS_URL_KEY) ||
    (import.meta.env.VITE_TURSO_URL as string | undefined) ||
    undefined
  );
}

export function getTursoToken(): string | undefined {
  return (
    localStorage.getItem(LS_TOKEN_KEY) ||
    (import.meta.env.VITE_TURSO_AUTH_TOKEN as string | undefined) ||
    undefined
  );
}

export function isTursoConfigured(): boolean {
  return Boolean(getTursoUrl() && getTursoToken());
}

/** Persist credentials to localStorage (takes effect immediately, no rebuild) */
export function saveCredentials(url: string, token: string): void {
  // Auto-correct libsql:// → https://
  const normalized = url.replace(/^libsql:\/\//, "https://");
  localStorage.setItem(LS_URL_KEY, normalized);
  localStorage.setItem(LS_TOKEN_KEY, token);
}

export function clearCredentials(): void {
  localStorage.removeItem(LS_URL_KEY);
  localStorage.removeItem(LS_TOKEN_KEY);
}
