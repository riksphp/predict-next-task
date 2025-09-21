const THEME_KEY = 'ntp_theme_v2';

type ThemeName =
  | 'light'
  | 'cupcake'
  | 'corporate'
  | 'bumblebee'
  | 'business'
  | 'emerald'
  | 'winter';

function hasChromeStorage(): boolean {
  const api = (window as any).chrome;
  return Boolean(api && api.storage && api.storage.local);
}

export async function readTheme(): Promise<ThemeName | null> {
  try {
    if (hasChromeStorage()) {
      const api = (window as any).chrome;
      return new Promise((resolve) => {
        api.storage.local.get([THEME_KEY], (items: Record<string, unknown>) => {
          resolve((items?.[THEME_KEY] as ThemeName) || null);
        });
      });
    }
    const raw = localStorage.getItem(THEME_KEY);
    return (raw as ThemeName) || null;
  } catch {
    return null;
  }
}

export async function writeTheme(theme: ThemeName): Promise<void> {
  try {
    if (hasChromeStorage()) {
      const api = (window as any).chrome;
      await new Promise<void>((resolve) => {
        api.storage.local.set({ [THEME_KEY]: theme }, () => resolve());
      });
      return;
    }
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export type { ThemeName };
