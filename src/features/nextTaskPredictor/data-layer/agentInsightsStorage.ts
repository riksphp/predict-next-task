const KEY = 'agentProfileInsights';

function hasChromeStorage(): boolean {
  return Boolean((window as any).chrome?.storage?.local);
}

export async function getAgentInsights(): Promise<{
  preferences?: Record<string, unknown>;
  skills?: string[];
  insights?: string[];
}> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        (window as any).chrome.storage.local.get([KEY], (items: Record<string, unknown>) => {
          resolve(((items?.[KEY] as any) || {}) as any);
        });
      });
    }
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as any) : {};
  } catch {
    return {};
  }
}
