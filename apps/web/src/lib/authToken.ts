const TOKEN_KEY = "learn-english-auth-token";

// A plain window CustomEvent, same pub/sub pattern already used for
// achievement-unlock toasts - there's no auth context provider to prop this
// through, so anything that needs to react to sign-in/sign-out (useAuth)
// listens for this instead.
const AUTH_CHANGED_EVENT = "auth-token-changed";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable (e.g. private browsing) - the session just won't
    // persist across reloads, but the app keeps working for this tab.
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function onAuthTokenChanged(callback: () => void): () => void {
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, callback);
}
