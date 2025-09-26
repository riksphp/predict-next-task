import { Tool } from './types';

type ScoreEntry = { id: string; event: string; points: number; timestamp: number; meta?: any };
type ScoreState = { totalPoints: number; entries: ScoreEntry[] };
const KEY = 'agentScore';

async function getState(): Promise<ScoreState> {
  try {
    if ((window as any).chrome?.storage?.local) {
      const items = await new Promise<any>((resolve) =>
        (window as any).chrome.storage.local.get([KEY], resolve),
      );
      return (items?.[KEY] as ScoreState) || { totalPoints: 0, entries: [] };
    }
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScoreState) : { totalPoints: 0, entries: [] };
  } catch {
    return { totalPoints: 0, entries: [] };
  }
}

async function setState(v: ScoreState): Promise<void> {
  try {
    if ((window as any).chrome?.storage?.local) {
      await new Promise<void>((resolve) =>
        (window as any).chrome.storage.local.set({ [KEY]: v }, () => resolve()),
      );
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}

export const scoreAwardTool: Tool<{ event: string; points: number; meta?: any }, ScoreState> = {
  name: 'score.award',
  async execute(args): Promise<ScoreState> {
    const state = await getState();
    const entry: ScoreEntry = {
      id: String(Date.now()),
      event: args.event,
      points: args.points,
      timestamp: Date.now(),
      meta: args.meta,
    };
    const next = {
      totalPoints: state.totalPoints + args.points,
      entries: [entry, ...state.entries],
    } satisfies ScoreState;
    await setState(next);
    return next;
  },
};
