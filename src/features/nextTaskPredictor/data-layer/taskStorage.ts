const PREDICTED_TASKS_KEY = 'predictedTasks';
const COMPLETED_TASKS_KEY = 'completedTasks';

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getPredictedTasks(): Promise<string[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([PREDICTED_TASKS_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[PREDICTED_TASKS_KEY] as string[]) || []);
        });
      });
    }
    const raw = localStorage.getItem(PREDICTED_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function savePredictedTasks(tasks: string[]): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [PREDICTED_TASKS_KEY]: tasks }, () => resolve());
      });
      return;
    }
    localStorage.setItem(PREDICTED_TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export async function getCompletedTasks(): Promise<string[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([COMPLETED_TASKS_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[COMPLETED_TASKS_KEY] as string[]) || []);
        });
      });
    }
    const raw = localStorage.getItem(COMPLETED_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCompletedTasks(tasks: string[]): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [COMPLETED_TASKS_KEY]: tasks }, () => resolve());
      });
      return;
    }
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export async function addPredictedTask(task: string): Promise<void> {
  const tasks = await getPredictedTasks();
  const completed = await getCompletedTasks();
  
  if (!tasks.includes(task) && !completed.includes(task)) {
    await savePredictedTasks([...tasks, task]);
  }
}

export async function completeTask(task: string): Promise<void> {
  const predicted = await getPredictedTasks();
  const completed = await getCompletedTasks();
  
  await savePredictedTasks(predicted.filter(t => t !== task));
  await saveCompletedTasks([...completed, task]);
}