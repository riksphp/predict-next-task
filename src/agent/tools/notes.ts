import { Tool } from './types';

type Note = { id: string; threadId: string; title: string; content: string; createdAt: number };
const KEY = 'agentNotes';

async function getAll(): Promise<Note[]> {
  try {
    if ((window as any).chrome?.storage?.local) {
      const items = await new Promise<any>((resolve) =>
        (window as any).chrome.storage.local.get([KEY], resolve),
      );
      return (items?.[KEY] as Note[]) || [];
    }
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

async function setAll(notes: Note[]): Promise<void> {
  try {
    if ((window as any).chrome?.storage?.local) {
      await new Promise<void>((resolve) =>
        (window as any).chrome.storage.local.set({ [KEY]: notes }, () => resolve()),
      );
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {}
}

export const notesCreateTool: Tool<{ title: string; content: string; threadId: string }, Note> = {
  name: 'notes.create',
  async execute(args: { title: string; content: string; threadId: string }): Promise<Note> {
    const list = await getAll();
    const item: Note = {
      id: String(Date.now()),
      threadId: args.threadId,
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    };
    await setAll([item, ...list]);
    return item;
  },
};

export const notesListTool: Tool<{ threadId: string }, Note[]> = {
  name: 'notes.list',
  async execute(args): Promise<Note[]> {
    const list = await getAll();
    return list.filter((n) => n.threadId === args.threadId);
  },
};
