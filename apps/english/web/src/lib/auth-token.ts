const TOKEN_KEY = 'learn-english-auth-token';

// A window event, so the auth context and the tRPC client both see a token
// change no matter which part of the app made it.
const AUTH_CHANGED_EVENT = 'auth-token-changed';

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
