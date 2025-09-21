const USER_CONTEXT_KEY = 'userContext';

export interface ContextData {
  name?: string;
  profession?: string;
  mood?: string;
  todos?: string[];
  quickNotes?: string[];
  preferences?: Record<string, any>;
  serverResponse?: string;
}

export interface UserContext {
  [timestamp: string]: ContextData;
}

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getUserContext(): Promise<UserContext> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([USER_CONTEXT_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[USER_CONTEXT_KEY] as UserContext) || {});
        });
      });
    }
    const raw = localStorage.getItem(USER_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveUserContext(context: UserContext): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [USER_CONTEXT_KEY]: context }, () => resolve());
      });
      return;
    }
    localStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    // ignore
  }
}

export async function addNewContext(newContext: ContextData): Promise<void> {
  const existing = await getUserContext();
  const timestamp = new Date().toISOString();
  const updated = {
    ...existing,
    [timestamp]: newContext,
  };
  await saveUserContext(updated);
}
