import { Tool, ToolExecutionContext } from './types';
import {
  addPredictedTask,
  getPredictedTasks,
  getCompletedTasks,
  completeTask,
} from '../../features/nextTaskPredictor/data-layer/taskStorage';
import {
  addCategorizedTask,
  categorizeTask,
} from '../../features/nextTaskPredictor/data-layer/taskCategoryStorage';

export const todoAddTool: Tool<{ text: string; threadId: string }, { ok: true; text: string }> = {
  name: 'todos.add',
  async execute(args, _ctx: ToolExecutionContext): Promise<{ ok: true; text: string }> {
    const text = args.text.trim();
    if (!text) return { ok: true, text };
    await addPredictedTask(text);
    const cat = categorizeTask(text);
    await addCategorizedTask(text, cat);
    return { ok: true, text };
  },
};

export const todoCompleteTool: Tool<{ text: string }, { ok: boolean; text: string }> = {
  name: 'todos.complete',
  async execute(args): Promise<{ ok: boolean; text: string }> {
    try {
      await completeTask(args.text);
      return { ok: true, text: args.text };
    } catch {
      return { ok: false, text: args.text };
    }
  },
};

export const todoListTool: Tool<{ status?: 'pending' | 'completed' }, string[]> = {
  name: 'todos.list',
  async execute(args): Promise<string[]> {
    if (args.status === 'completed') {
      return await getCompletedTasks();
    }
    if (args.status === 'pending') {
      const predicted = await getPredictedTasks();
      const completed = await getCompletedTasks();
      return predicted.filter((p) => !completed.includes(p));
    }
    // default: all tasks
    const predicted = await getPredictedTasks();
    const completed = await getCompletedTasks();
    return [...predicted, ...completed];
  },
};
