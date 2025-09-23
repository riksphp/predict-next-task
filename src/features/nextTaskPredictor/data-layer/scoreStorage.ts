const USER_SCORE_KEY = 'userScore';
const SCORE_HISTORY_KEY = 'scoreHistory';

export interface ScoreEntry {
  id: string;
  task: string;
  category: string;
  interactionType: string;
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  timestamp: string;
}

export interface UserScore {
  totalPoints: number;
  level: number;
  completedTasks: number;
  averageScore: number;
  lastUpdated: string;
}

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getUserScore(): Promise<UserScore> {
  try {
    let score: UserScore;
    if (hasChromeStorage()) {
      score = await new Promise((resolve) => {
        window.chrome!.storage!.local.get([USER_SCORE_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[USER_SCORE_KEY] as UserScore) || getDefaultScore());
        });
      });
    } else {
      const raw = localStorage.getItem(USER_SCORE_KEY);
      score = raw ? JSON.parse(raw) : getDefaultScore();
    }

    console.log('📖 getUserScore returned:', {
      totalPoints: score.totalPoints,
      completedTasks: score.completedTasks,
      level: score.level,
      timestamp: score.lastUpdated,
    });

    return score;
  } catch {
    const defaultScore = getDefaultScore();
    console.log('📖 getUserScore fallback to default:', defaultScore);
    return defaultScore;
  }
}

export async function saveUserScore(score: UserScore): Promise<void> {
  const withTimestamp = { ...score, lastUpdated: new Date().toISOString() };

  console.log('💾 saveUserScore called with:', {
    totalPoints: withTimestamp.totalPoints,
    completedTasks: withTimestamp.completedTasks,
    level: withTimestamp.level,
  });

  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [USER_SCORE_KEY]: withTimestamp }, () => {
          console.log('💾 Chrome storage.local.set completed');
          resolve();
        });
      });
      console.log('💾 saveUserScore finished successfully (Chrome)');
      return;
    }
    localStorage.setItem(USER_SCORE_KEY, JSON.stringify(withTimestamp));
    console.log('💾 saveUserScore finished successfully (localStorage)');
  } catch (error) {
    console.error('💾 Failed to save user score:', error);
  }
}

export async function getScoreHistory(): Promise<ScoreEntry[]> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([SCORE_HISTORY_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[SCORE_HISTORY_KEY] as ScoreEntry[]) || []);
        });
      });
    }
    const raw = localStorage.getItem(SCORE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveScoreHistory(history: ScoreEntry[]): Promise<void> {
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [SCORE_HISTORY_KEY]: history }, () => resolve());
      });
      return;
    }
    localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export async function addScoreEntry(
  entry: Omit<ScoreEntry, 'id' | 'timestamp'>,
): Promise<UserScore> {
  const newEntry: ScoreEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  // Add to history
  const history = await getScoreHistory();
  const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50 entries
  await saveScoreHistory(updatedHistory);

  // Update user score
  const currentScore = await getUserScore();
  const newTotalPoints = currentScore.totalPoints + entry.score;
  const newCompletedTasks = currentScore.completedTasks + 1;
  const newAverageScore =
    updatedHistory.reduce((sum, h) => sum + h.score, 0) / updatedHistory.length;
  const newLevel = Math.floor(newTotalPoints / 100) + 1; // Level up every 100 points

  const updatedScore: UserScore = {
    totalPoints: newTotalPoints,
    level: newLevel,
    completedTasks: newCompletedTasks,
    averageScore: Math.round(newAverageScore * 10) / 10,
    lastUpdated: new Date().toISOString(),
  };

  await saveUserScore(updatedScore);
  return updatedScore;
}

function getDefaultScore(): UserScore {
  return {
    totalPoints: 0,
    level: 1,
    completedTasks: 0,
    averageScore: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export function calculateScoreFromPercentage(percentage: number, maxPoints = 10): number {
  return Math.round((percentage / 100) * maxPoints);
}

export async function awardPointsForTaskCompletion(
  task: string,
  category?: string,
): Promise<UserScore> {
  console.log('🎁 awardPointsForTaskCompletion called for:', task, 'category:', category);

  // Check if we already have a score entry for this exact task to prevent duplicates
  const existingScoreHistory = await getScoreHistory();
  const taskAlreadyScored = existingScoreHistory.some(
    (entry) => entry.task === task && entry.interactionType === 'task_completion',
  );

  console.log('📊 Score check:', {
    taskAlreadyScored,
    existingEntriesCount: existingScoreHistory.length,
    matchingEntries: existingScoreHistory.filter((entry) => entry.task === task).length,
  });

  if (taskAlreadyScored) {
    console.log('❌ Task already scored, skipping points award:', task);
    return await getUserScore(); // Return current score without changes
  }

  console.log('✅ Proceeding with scoring for:', task);

  const currentScore = await getUserScore();
  const completionPoints = 5; // Base points for completing any task
  const categoryBonus = getCategoryBonus(category);
  const totalPoints = completionPoints + categoryBonus;

  console.log('💰 Points calculation:', {
    currentPoints: currentScore.totalPoints,
    completionPoints,
    categoryBonus,
    totalPointsToAdd: totalPoints,
  });

  // Create score entry for task completion
  const scoreEntry: ScoreEntry = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    task: task,
    category: category || 'general',
    interactionType: 'task_completion',
    score: totalPoints,
    maxScore: totalPoints,
    percentage: 100,
    feedback: `Task completed successfully! +${totalPoints} points`,
    timestamp: new Date().toISOString(),
  };

  // Update user score
  const newTotalPoints = currentScore.totalPoints + totalPoints;
  const newCompletedTasks = currentScore.completedTasks + 1;
  const newLevel = calculateLevel(newTotalPoints);

  // Calculate new average score including task completion scores
  const currentScoreHistory = await getScoreHistory();
  const allScores = [...currentScoreHistory, scoreEntry];
  const newAverageScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((sum, entry) => sum + entry.percentage, 0) / allScores.length)
      : 0;

  const updatedScore: UserScore = {
    totalPoints: newTotalPoints,
    level: newLevel,
    completedTasks: newCompletedTasks,
    averageScore: newAverageScore,
    lastUpdated: new Date().toISOString(),
  };

  // Save both score and history
  console.log('💾 Saving updated score:', {
    newTotalPoints: updatedScore.totalPoints,
    newLevel: updatedScore.level,
    newCompletedTasks: updatedScore.completedTasks,
  });

  await saveUserScore(updatedScore);
  await addScoreEntry(scoreEntry);

  // Verify the data was saved correctly
  const verifyScore = await getUserScore();
  const verifyHistory = await getScoreHistory();
  console.log('🔍 Verification after save:', {
    actualTotalPoints: verifyScore.totalPoints,
    actualCompletedTasks: verifyScore.completedTasks,
    historyCount: verifyHistory.length,
    lastHistoryEntry: verifyHistory[0]?.task || 'none',
  });

  console.log('🎉 Scoring completed successfully for:', task);
  return updatedScore;
}

function getCategoryBonus(category?: string): number {
  if (!category) return 0;

  // Award bonus points based on task category difficulty/importance
  const categoryBonuses: Record<string, number> = {
    'work-productivity': 3,
    'learning-growth': 4,
    'health-wellness': 2,
    'mindfulness-presence': 3,
    communication: 2,
    'planning-goals': 2,
    'creativity-expression': 2,
    'relationships-compassion': 2,
    'organization-responsibility': 2,
    'reflection-acceptance': 3,
    'physical-activity': 2,
    'maintenance-care': 1,
  };

  return categoryBonuses[category] || 1;
}

function calculateLevel(totalPoints: number): number {
  // Level calculation: every 100 points = 1 level
  // Level 1: 0-99 points
  // Level 2: 100-199 points
  // Level 3: 200-299 points, etc.
  return Math.floor(totalPoints / 100) + 1;
}
