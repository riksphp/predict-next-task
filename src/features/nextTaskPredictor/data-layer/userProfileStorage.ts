const USER_PROFILE_KEY = 'userProfile';

export interface UserProfile {
  name?: string;
  profession?: string;
  mood?: string;
  goals?: string[];
  preferences?: Record<string, unknown>;
  interests?: string[];
  priorities?: string[];
  character?: string;
  workStyle?: string;
  lastUpdated?: string;
}

function hasChromeStorage(): boolean {
  return Boolean(window.chrome && window.chrome.storage && window.chrome.storage.local);
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    if (hasChromeStorage()) {
      return new Promise((resolve) => {
        window.chrome!.storage!.local.get([USER_PROFILE_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[USER_PROFILE_KEY] as UserProfile) || {});
        });
      });
    }
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const withTimestamp: UserProfile = { ...profile, lastUpdated: new Date().toISOString() };
  try {
    if (hasChromeStorage()) {
      await new Promise<void>((resolve) => {
        window.chrome!.storage!.local.set({ [USER_PROFILE_KEY]: withTimestamp }, () => resolve());
      });
      return;
    }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(withTimestamp));
  } catch {
    // ignore
  }
}

export function mergeProfiles(existing: UserProfile, incoming: UserProfile): UserProfile {
  // field-wise merge: prefer incoming when truthy; merge arrays and objects smartly
  const mergedPreferences = {
    ...(existing.preferences || {}),
    ...(incoming.preferences || {}),
  } as Record<string, unknown>;

  const mergeArray = (a?: string[], b?: string[]) =>
    Array.from(new Set([...(a || []), ...(b || [])]));

  return {
    name: incoming.name || existing.name,
    profession: incoming.profession || existing.profession,
    mood: incoming.mood || existing.mood,
    goals: mergeArray(existing.goals, incoming.goals),
    preferences: mergedPreferences,
    interests: mergeArray(existing.interests, incoming.interests),
    priorities: mergeArray(existing.priorities, incoming.priorities),
    character: incoming.character || existing.character,
    workStyle: incoming.workStyle || existing.workStyle,
    lastUpdated: new Date().toISOString(),
  };
}

export async function updateUserProfile(partial: UserProfile): Promise<UserProfile> {
  const existing = await getUserProfile();
  const merged = mergeProfiles(existing, partial);
  await saveUserProfile(merged);
  return merged;
}
