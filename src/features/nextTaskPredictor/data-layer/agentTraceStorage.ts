import { AgentTrace } from '../../../agent/core/types';

const TRACES_KEY = 'agentTraces';

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getAgentTraces(): Promise<AgentTrace[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([TRACES_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[TRACES_KEY] as AgentTrace[]) || []);
        });
      });
    }
    const raw = localStorage.getItem(TRACES_KEY);
    return raw ? (JSON.parse(raw) as AgentTrace[]) : [];
  } catch {
    return [];
  }
}

export async function appendAgentTrace(trace: AgentTrace): Promise<void> {
  try {
    const traces = await getAgentTraces();
    const updated = [...traces, trace];
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [TRACES_KEY]: updated }, () => resolve());
      });
      return;
    }
    localStorage.setItem(TRACES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function clearAgentTraces(): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [TRACES_KEY]: [] }, () => resolve());
      });
      return;
    }
    localStorage.setItem(TRACES_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
}
