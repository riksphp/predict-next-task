import {
  TASK_CATEGORIES,
  TASK_CATEGORY_KEYWORDS,
  type TaskCategory,
} from '../constants/taskCategories';

// Re-export for backward compatibility
export type { TaskCategory };

const TASK_CATEGORIES_KEY = 'taskCategories';

export interface CategorizedTask {
  task: string;
  category: TaskCategory;
  timestamp: string;
}

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getTaskCategories(): Promise<CategorizedTask[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get(
          [TASK_CATEGORIES_KEY],
          (items: Record<string, unknown>) => {
            resolve((items?.[TASK_CATEGORIES_KEY] as CategorizedTask[]) || []);
          },
        );
      });
    }
    const raw = localStorage.getItem(TASK_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTaskCategories(tasks: CategorizedTask[]): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [TASK_CATEGORIES_KEY]: tasks }, () => resolve());
      });
      return;
    }
    localStorage.setItem(TASK_CATEGORIES_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export async function addCategorizedTask(task: string, category: TaskCategory): Promise<void> {
  const tasks = await getTaskCategories();
  const newTask: CategorizedTask = {
    task,
    category,
    timestamp: new Date().toISOString(),
  };

  // Keep only last 20 tasks to prevent storage bloat
  const updated = [newTask, ...tasks].slice(0, 20);
  await saveTaskCategories(updated);
}

export async function getRecentCategoriesCount(hours = 24): Promise<Record<TaskCategory, number>> {
  const tasks = await getTaskCategories();
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const recentTasks = tasks.filter((t) => t.timestamp > cutoff);
  const counts: Record<string, number> = {};

  recentTasks.forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });

  return counts as Record<TaskCategory, number>;
}

export function categorizeTask(task: string): TaskCategory {
  const lowerTask = task.toLowerCase();

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(TASK_CATEGORY_KEYWORDS)) {
    if (keywords.length > 0 && keywords.some((keyword) => lowerTask.includes(keyword))) {
      return category as TaskCategory;
    }
  }

  return TASK_CATEGORIES.WORK_PRODUCTIVITY; // default
}
