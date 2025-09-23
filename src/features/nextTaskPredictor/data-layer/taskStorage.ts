const PREDICTED_TASKS_KEY = 'predictedTasks';
const COMPLETED_TASKS_KEY = 'completedTasks';

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getPredictedTasks(): Promise<string[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get(
          [PREDICTED_TASKS_KEY],
          (items: Record<string, unknown>) => {
            resolve((items?.[PREDICTED_TASKS_KEY] as string[]) || []);
          },
        );
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
        window.chrome!.storage!.local.get(
          [COMPLETED_TASKS_KEY],
          (items: Record<string, unknown>) => {
            resolve((items?.[COMPLETED_TASKS_KEY] as string[]) || []);
          },
        );
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
  console.log('🎯 completeTask called for:', task);

  const predicted = await getPredictedTasks();
  const completed = await getCompletedTasks();

  console.log('📊 Current state:', {
    predictedCount: predicted.length,
    completedCount: completed.length,
    taskInPredicted: predicted.includes(task),
    taskInCompleted: completed.includes(task),
  });

  // Check if task is already completed to prevent double scoring
  if (completed.includes(task)) {
    console.log('❌ Task already completed, skipping scoring:', task);
    return;
  }

  console.log('✅ Proceeding with task completion for:', task);

  // Remove from predicted and add to completed
  await savePredictedTasks(predicted.filter((t) => t !== task));
  await saveCompletedTasks([...completed, task]);

  console.log('💾 Task moved to completed list:', task);

  // Award points for task completion (only if not already completed)
  const { awardPointsForTaskCompletion } = await import('./scoreStorage');
  const { categorizeTask } = await import('./taskCategoryStorage');

  const taskCategory = categorizeTask(task);
  console.log('🏷️ Task category determined:', taskCategory);

  console.log('🎁 About to award points for:', task);
  await awardPointsForTaskCompletion(task, taskCategory);
  console.log('✨ Points awarded for:', task);
}
