import { Tool } from './types';
import { updateUserProfile } from '../../features/nextTaskPredictor/data-layer/userProfileStorage';

type ProfileInsightsStore = { preferences?: any; skills?: string[]; insights?: string[] };
type ProfileArgs = {
  name?: string;
  profession?: string;
  mood?: string;
  workStyle?: string;
  preferences?: Record<string, unknown>;
  skills?: string[];
  insights?: string[];
};
const KEY = 'agentProfileInsights';

async function getProfile(): Promise<ProfileInsightsStore> {
  try {
    if ((window as any).chrome?.storage?.local) {
      const items = await new Promise<any>((resolve) =>
        (window as any).chrome.storage.local.get([KEY], resolve),
      );
      return (items?.[KEY] as ProfileInsightsStore) || {};
    }
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProfileInsightsStore) : {};
  } catch {
    return {};
  }
}

async function setProfile(v: ProfileInsightsStore): Promise<void> {
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

export const saveProfileInsightsTool: Tool<ProfileArgs, any> = {
  name: 'profile.saveInsights',
  async execute(args): Promise<any> {
    // 1) Update the dashboard profile (name, profession, mood, workStyle, preferences)
    await updateUserProfile({
      name: args.name,
      profession: args.profession,
      mood: args.mood,
      workStyle: args.workStyle,
      preferences: args.preferences,
    });

    // 2) Also maintain insights store (skills/insights/preferences) for widgets that read it
    const cur = await getProfile();
    const next: ProfileInsightsStore = {
      preferences: { ...(cur.preferences || {}), ...(args.preferences || {}) },
      skills: Array.from(new Set([...(cur.skills || []), ...(args.skills || [])])),
      insights: Array.from(new Set([...(cur.insights || []), ...(args.insights || [])])),
    };
    await setProfile(next);
    return { saved: true, profile: { ...args }, insightsStore: next };
  },
};
