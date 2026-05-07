const SESSION_STORAGE_KEY = "voiceEngineSessionId";

export function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}