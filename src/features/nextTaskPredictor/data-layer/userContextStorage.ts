const USER_CONTEXT_KEY = 'userContext';

export interface UserContext {
  name?: string;
  profession?: string;
  mood?: string;
  todos?: string[];
  quickNotes?: string[];
  preferences?: Record<string, any>;
  predictedToDo?: string[];
  completedToDo?: string[];
  serverResponse?: string;
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

export function mergeUserContext(existing: UserContext, newContext: UserContext): UserContext {
  return {
    name: newContext.name || existing.name,
    profession: newContext.profession || existing.profession,
    mood: newContext.mood || existing.mood,
    todos: [...(existing.todos || []), ...(newContext.todos || [])],
    quickNotes: [...(existing.quickNotes || []), ...(newContext.quickNotes || [])],
    preferences: { ...(existing.preferences || {}), ...(newContext.preferences || {}) }
  };
}