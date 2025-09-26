import { Tool } from './types';

type Task = {
  text: string;
  category?: string;
  status: 'pending' | 'completed';
  completedAt?: number;
};
const TASKS_KEY = 'predictedTasks';
const COMPLETED_KEY = 'completedTasks';

async function getJson<T>(key: string, def: T): Promise<T> {
  try {
    if ((window as any).chrome?.storage?.local) {
      const items = await new Promise<any>((resolve) =>
        (window as any).chrome.storage.local.get([key], resolve),
      );
      return (items?.[key] as T) || def;
    }
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : def;
  } catch {
    return def;
  }
}

export const activityByCategoryTool: Tool<{ windowHours: number }, Record<string, number>> = {
  name: 'activityByCategory.compute',
  async execute(args): Promise<Record<string, number>> {
    const now = Date.now();
    const windowMs = args.windowHours * 3600_000;
    const predicted = await getJson<string[]>(TASKS_KEY, []);
    const completed = await getJson<string[]>(COMPLETED_KEY, []);
    // naive categorization by keyword
    const categorize = (t: string): string => {
      const s = t.toLowerCase();
      if (s.includes('learn') || s.includes('read')) return 'education';
      if (s.includes('build') || s.includes('implement')) return 'work';
      if (s.includes('exercise') || s.includes('walk')) return 'health';
      return 'general';
    };
    const stats: Record<string, number> = {};
    for (const t of completed.concat(predicted)) {
      const c = categorize(t);
      stats[c] = (stats[c] || 0) + 1;
    }
    return stats;
  },
};
