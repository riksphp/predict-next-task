const STORAGE_KEY = 'ntp_user_context_v1';

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export type StoredContext = { text: string; updatedAt: string };

export async function readStoredContext(): Promise<StoredContext | null> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([STORAGE_KEY], (items: Record<string, unknown>) => {
          const value = items?.[STORAGE_KEY];
          if (value && typeof value === 'object' && value !== null) {
            resolve(value as StoredContext);
          } else {
            resolve(null);
          }
        });
      });
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredContext) : null;
  } catch {
    return null;
  }
}

export async function writeStoredContext(payload: StoredContext): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [STORAGE_KEY]: payload }, () => resolve());
      });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}
