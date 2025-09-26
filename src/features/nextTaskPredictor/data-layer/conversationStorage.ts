const THREADS_KEY = 'conversationThreads';
const MESSAGES_KEY = 'conversationMessages';
const CURRENT_THREAD_ID_KEY = 'currentThreadId';
const THREAD_SUMMARY_KEY_PREFIX = 'conversationSummary:';

export type ConversationRole = 'user' | 'assistant' | 'system';

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  threadId: string;
  role: ConversationRole;
  text: string;
  timestamp: string;
}

export async function clearThreadMessages(threadId: string): Promise<void> {
  const all = await getAllMessages();
  const remaining = all.filter((m) => m.threadId !== threadId);
  await saveAllMessages(remaining);
}

export async function getThreadSummary(threadId: string): Promise<string | null> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        const key = THREAD_SUMMARY_KEY_PREFIX + threadId;
        window.chrome!.storage!.local.get([key], (items: Record<string, unknown>) => {
          resolve((items?.[key] as string) || null);
        });
      });
    }
    return localStorage.getItem(THREAD_SUMMARY_KEY_PREFIX + threadId);
  } catch {
    return null;
  }
}

export async function setThreadSummary(threadId: string, summary: string): Promise<void> {
  try {
    if (hasChromeStorage()) {
      const key = THREAD_SUMMARY_KEY_PREFIX + threadId;
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [key]: summary }, () => resolve());
      });
      return;
    }
    localStorage.setItem(THREAD_SUMMARY_KEY_PREFIX + threadId, summary);
  } catch {
    // ignore
  }
}

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

async function getAllMessages(): Promise<ConversationMessage[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([MESSAGES_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[MESSAGES_KEY] as ConversationMessage[]) || []);
        });
      });
    }
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAllMessages(messages: ConversationMessage[]): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [MESSAGES_KEY]: messages }, () => resolve());
      });
      return;
    }
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // ignore
  }
}

export async function getThreads(): Promise<ConversationThread[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([THREADS_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[THREADS_KEY] as ConversationThread[]) || []);
        });
      });
    }
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveThreads(threads: ConversationThread[]): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [THREADS_KEY]: threads }, () => resolve());
      });
      return;
    }
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  } catch {
    // ignore
  }
}

export async function getCurrentThreadId(): Promise<string | null> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get(
          [CURRENT_THREAD_ID_KEY],
          (items: Record<string, unknown>) => {
            resolve((items?.[CURRENT_THREAD_ID_KEY] as string) || null);
          },
        );
      });
    }
    return localStorage.getItem(CURRENT_THREAD_ID_KEY);
  } catch {
    return null;
  }
}

export async function setCurrentThreadId(threadId: string): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [CURRENT_THREAD_ID_KEY]: threadId }, () => resolve());
      });
      return;
    }
    localStorage.setItem(CURRENT_THREAD_ID_KEY, threadId);
  } catch {
    // ignore
  }
}

export async function createThread(title = 'New chat'): Promise<ConversationThread> {
  const threads = await getThreads();
  const newThread: ConversationThread = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveThreads([newThread, ...threads]);
  await setCurrentThreadId(newThread.id);
  return newThread;
}

export async function getOrCreateDefaultThread(): Promise<ConversationThread> {
  const threads = await getThreads();
  if (threads.length === 0) {
    return createThread('Chat');
  }
  const currentId = await getCurrentThreadId();
  const found = threads.find((t) => t.id === currentId) || threads[0];
  await setCurrentThreadId(found.id);
  return found;
}

export async function renameThread(threadId: string, title: string): Promise<void> {
  const threads = await getThreads();
  const updated = threads.map((t) =>
    t.id === threadId ? { ...t, title, updatedAt: new Date().toISOString() } : t,
  );
  await saveThreads(updated);
}

export async function getMessages(threadId: string): Promise<ConversationMessage[]> {
  const all = await getAllMessages();
  return all
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export async function addMessage(
  threadId: string,
  role: ConversationRole,
  text: string,
): Promise<ConversationMessage> {
  const message: ConversationMessage = {
    id: crypto.randomUUID(),
    threadId,
    role,
    text,
    timestamp: new Date().toISOString(),
  };
  const all = await getAllMessages();
  const updated = [...all, message];
  await saveAllMessages(updated);

  // bump thread updatedAt
  const threads = await getThreads();
  const updatedThreads = threads.map((t) =>
    t.id === threadId ? { ...t, updatedAt: message.timestamp } : t,
  );
  await saveThreads(updatedThreads);
  return message;
}
