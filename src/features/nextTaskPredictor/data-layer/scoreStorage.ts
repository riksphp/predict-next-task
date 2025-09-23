const USER_SCORE_KEY = 'userScore';
const SCORE_HISTORY_KEY = 'scoreHistory';

export interface ScoreEntry {
  id: string;
  task: string;
  score: number;
  maxScore: number;
  feedback: string;
  timestamp: string;
  category: string;
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
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([USER_SCORE_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[USER_SCORE_KEY] as UserScore) || getDefaultScore());
        });
      });
    }
    const raw = localStorage.getItem(USER_SCORE_KEY);
    return raw ? JSON.parse(raw) : getDefaultScore();
  } catch {
    return getDefaultScore();
  }
}

export async function saveUserScore(score: UserScore): Promise<void> {
  const withTimestamp = { ...score, lastUpdated: new Date().toISOString() };
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [USER_SCORE_KEY]: withTimestamp }, () => resolve());
      });
      return;
    }
    localStorage.setItem(USER_SCORE_KEY, JSON.stringify(withTimestamp));
  } catch {
    // ignore
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
