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
import { type TaskCategory, PRIORITY_GROUPS } from '../constants/taskCategories';

export async function predictNextTask(): Promise<string> {
  const userContext = await getUserContext();
  const predictedTasks = await getPredictedTasks();
  const completedTasks = await getCompletedTasks();
  const profile = await getUserProfile();
  const thread = await getOrCreateDefaultThread();
  const recentMessages = (await getMessages(thread.id))
    .slice(-8)
    .map((m) => ({ role: m.role, text: m.text }));
  const recentCategories = await getRecentCategoriesCount(24);

  // Enhanced repetition prevention logic
  const allPreviousTasks = [...predictedTasks, ...completedTasks];
  const pendingTasksCount = predictedTasks.length;
  const completedTasksCount = completedTasks.length;

  // Force category change if user has pending tasks but no recent completions
  const shouldForceNewCategory = pendingTasksCount > 0 && completedTasksCount === 0;
  const shouldAvoidSimilarTasks = pendingTasksCount > 2; // More than 2 pending tasks

  // Get or create user analysis
  //   let userAnalysis = await getUserAnalysis();
  //   if (!userAnalysis) {
  //   userAnalysis = await analyzeUserInputs();
  //   }

  // Determine priority level based on available context
  const hasUserInput =
    (profile.goals && profile.goals.length > 0) ||
    Object.values(userContext).some((ctx) => ctx.todos && ctx.todos.length > 0) ||
    recentMessages.length > 0;

  let currentPriority = 'FOUNDATIONAL';
  if (hasUserInput) {
    currentPriority = 'USER_INPUT';
  } else {
    // Cycle through professional → personal → foundational
    const recentCategoriesArray = Object.keys(recentCategories) as TaskCategory[];
    const hasRecentProfessional = recentCategoriesArray.some((cat) =>
      (PRIORITY_GROUPS.PROFESSIONAL_GROWTH as readonly string[]).includes(cat),
    );
    const hasRecentPersonal = recentCategoriesArray.some((cat) =>
      (PRIORITY_GROUPS.PERSONAL_GROWTH as readonly string[]).includes(cat),
    );

    if (!hasRecentProfessional) {
      currentPriority = 'PROFESSIONAL_GROWTH';
    } else if (!hasRecentPersonal) {
      currentPriority = 'PERSONAL_GROWTH';
    }
  }

  const enrichedContext = {
    userContext,
    // userAnalysis,
    predictedTasks,
    completedTasks,
    allPreviousTasks,
    profile,
    recentMessages,
    recentCategories,
    currentPriority,
    priorityGroups: PRIORITY_GROUPS,
    // Enhanced repetition prevention flags
    shouldForceNewCategory,
    shouldAvoidSimilarTasks,
    pendingTasksCount,
    completedTasksCount,
  };

  const prompt = PROMPTS.TEMPLATES.TASK_PREDICTION({ context: enrichedContext });

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
    // Format as clean one-liner with explanation and deadline
    const taskLine = parsed.task;
    const explanationLine = `${parsed.why || ''} (${
      parsed.interactionType?.toUpperCase() || 'INTERACTIVE'
    } • ${parsed.maxPoints || 10} points)`;
    const deadlineLine = `Due: ${parsed.deadlineIST || 'today IST'}`;

    if (parsed.task && parsed.task.trim()) {
      const newTask = parsed.task.trim();

      // Final validation: Check for similarity with existing tasks
      const isSimilarToExisting = allPreviousTasks.some((existingTask) => {
        const newTaskWords = newTask.toLowerCase().split(' ');
        const existingWords = existingTask.toLowerCase().split(' ');
        const commonWords = newTaskWords.filter(
          (word) => word.length > 3 && existingWords.includes(word),
        );
        return commonWords.length >= 2; // Too many common words
      });

      if (isSimilarToExisting && allPreviousTasks.length > 0) {
        // Generate a fallback task that's guaranteed to be different
        const fallbackTasks = [
          'Create a 5-minute musical rhythm using household items',
          'Write a funny haiku about your current mood',
          'Design a paper airplane and test its flight distance',
          'Practice drawing circles without lifting your pen for 3 minutes',
          'Create a mini workout using only a chair',
          "Write down 10 things you're grateful for in reverse alphabetical order",
          'Practice a 2-minute foreign language conversation with me',
          'Create a story using only questions',
        ];
        const randomFallback = fallbackTasks[Math.floor(Math.random() * fallbackTasks.length)];
        await addPredictedTask(randomFallback);
        const fallbackCategory = categorizeTask(randomFallback);
        await addCategorizedTask(randomFallback, fallbackCategory);

        return [
          randomFallback,
          '',
          "Let's try something completely different to add variety! (CREATIVE • 8 points)",
          '',
          'Due: today IST',
        ].join('\n');
      }

      await addPredictedTask(newTask);

      // Track category to prevent repetition
      const category = (parsed.category as TaskCategory) || categorizeTask(parsed.task);
      await addCategorizedTask(newTask, category);
    }

    return [taskLine, '', explanationLine, '', deadlineLine].join('\n');
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
