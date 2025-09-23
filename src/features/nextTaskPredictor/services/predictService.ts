import { getBaseTruths } from '../data-layer/baseTruths';
import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi } from '../data-layer/geminiApi';
import { getUserContext } from '../data-layer/userContextStorage';
// import { analyzeUserInputs, getUserAnalysis } from './analysisService';
import { addPredictedTask, getPredictedTasks, getCompletedTasks } from '../data-layer/taskStorage';
import { getUserProfile } from '../data-layer/userProfileStorage';
import { getOrCreateDefaultThread, getMessages } from '../data-layer/conversationStorage';
import {
  getRecentCategoriesCount,
  addCategorizedTask,
  categorizeTask,
} from '../data-layer/taskCategoryStorage';
import { type TaskCategory } from '../constants/taskCategories';

export async function predictNextTask(context: string): Promise<string> {
  const baseTruths = getBaseTruths();
  const userContext = await getUserContext();
  const predictedTasks = await getPredictedTasks();
  const completedTasks = await getCompletedTasks();
  const profile = await getUserProfile();
  const thread = await getOrCreateDefaultThread();
  const recentMessages = (await getMessages(thread.id))
    .slice(-8)
    .map((m) => ({ role: m.role, text: m.text }));
  const recentCategories = await getRecentCategoriesCount(24);

  // Get or create user analysis
  //   let userAnalysis = await getUserAnalysis();
  //   if (!userAnalysis) {
  //   userAnalysis = await analyzeUserInputs();
  //   }

  const enrichedContext = {
    userContext,
    // userAnalysis,
    predictedTasks,
    completedTasks,
    profile,
    recentMessages,
    recentCategories,
  };

  const prompt = PROMPTS.TEMPLATES.TASK_PREDICTION({ baseTruths, context: enrichedContext });

  const response = await callGeminiApi(prompt);

  // Prefer JSON parsing per strict template; fallback to plain text parsing
  let trimmed = response
    .trim()
    .replace(/```json|```/g, '')
    .trim();
  try {
    const parsed = JSON.parse(trimmed) as {
      task: string;
      why?: string;
      category?: string;
      interactionType?: string;
      durationMinutes?: number;
      deadlineIST?: string;
      maxPoints?: number;
      scoringCriteria?: string[];
      criteria?: string[]; // fallback for legacy format
    };
    const interactiveInfo = parsed.interactionType
      ? ` | ${parsed.interactionType.toUpperCase()} TASK`
      : '';
    const pointsInfo = parsed.maxPoints ? ` | Max ${parsed.maxPoints} points` : '';
    const smartLine = `${parsed.task} — ${parsed.why || ''}${interactiveInfo}${pointsInfo} [${
      parsed.durationMinutes || 30
    }m, deadline: ${parsed.deadlineIST || 'today IST'}]`;

    if (parsed.task && parsed.task.trim()) {
      await addPredictedTask(parsed.task.trim());

      // Track category to prevent repetition
      const category = (parsed.category as TaskCategory) || categorizeTask(parsed.task);
      await addCategorizedTask(parsed.task.trim(), category);
    }

    const criteria = parsed.scoringCriteria || parsed.criteria || [];
    return [smartLine, ...criteria.map((c) => `- [ ] ${c}`)].join('\n');
  } catch {
    // Extract main task from response and add to predicted tasks
    const lines = response.split('\n').filter((line) => line.trim());
    const mainTask =
      lines.find((line) => line.match(/^1\./))?.replace(/^1\.\s*/, '') || lines[0] || '';
    if (mainTask.trim()) {
      await addPredictedTask(mainTask.trim());
      // Track category even for fallback parsing
      const category = categorizeTask(mainTask.trim());
      await addCategorizedTask(mainTask.trim(), category);
    }
    return response;
  }
}
