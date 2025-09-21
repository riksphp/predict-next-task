import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readStoredContext, writeStoredContext } from '../data-layer/storage';

type Ctx = {
  context: string;
  setContext: (v: string) => void;
  storedPretty: string;
};

const UserContext = createContext<Ctx | null>(null);

export function UserContextProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [context, setContext] = useState<string>('');
  const [storedPretty, setStoredPretty] = useState<string>('');

  useEffect(() => {
    (async () => {
      const stored = await readStoredContext();
      if (stored && typeof stored.text === 'string') {
        setContext(stored.text);
      }
      setStoredPretty(JSON.stringify(stored ?? {}, null, 2));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const payload = { text: context, updatedAt: new Date().toISOString() };
      await writeStoredContext(payload);
      const stored = await readStoredContext();
      setStoredPretty(JSON.stringify(stored ?? {}, null, 2));
    })();
  }, [context]);

  const value = useMemo<Ctx>(
    () => ({ context, setContext, storedPretty }),
    [context, storedPretty],
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContextStore(): Ctx {
  const v = useContext(UserContext);
  if (!v) throw new Error('useUserContextStore must be used within UserContextProvider');
  return v;
}
