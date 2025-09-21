const USER_INPUTS_KEY = 'userInputs';

export interface UserInput {
  id: string;
  text: string;
  timestamp: string;
  source: 'home' | 'chat';
}

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getUserInputs(): Promise<UserInput[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([USER_INPUTS_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[USER_INPUTS_KEY] as UserInput[]) || []);
        });
      });
    }
    const raw = localStorage.getItem(USER_INPUTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUserInput(input: string, source: 'home' | 'chat'): Promise<void> {
  try {
    const existingInputs = await getUserInputs();
    const newInput: UserInput = {
      id: crypto.randomUUID(),
      text: input,
      timestamp: new Date().toISOString(),
      source
    };
    
    const updatedInputs = [newInput, ...existingInputs];
    
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [USER_INPUTS_KEY]: updatedInputs }, () => resolve());
      });
      return;
    }
    localStorage.setItem(USER_INPUTS_KEY, JSON.stringify(updatedInputs));
  } catch {
    // ignore
  }
}