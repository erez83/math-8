import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getAllAttempts, getAllQuizzes, getMeta, setMeta, type Attempt, type QuizResult } from './db';
import { groupBySubtopic } from './mastery';

interface Data {
  ready: boolean;
  attempts: Attempt[];
  bySubtopic: Map<string, Attempt[]>;
  quizzes: QuizResult[];
  practiceDays: string[];
  installedVersion: string;
  seenItems: string[];
  lastSubtopic?: string;
  fontScale: number;
  refresh: () => Promise<void>;
  markSeen: (id: string) => Promise<void>;
  setLastSubtopic: (id: string) => Promise<void>;
  setFontScale: (s: number) => Promise<void>;
}

const Ctx = createContext<Data | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<Data, 'refresh' | 'markSeen' | 'setLastSubtopic' | 'setFontScale' | 'bySubtopic'>>({
    ready: false,
    attempts: [],
    quizzes: [],
    practiceDays: [],
    installedVersion: __APP_VERSION__,
    seenItems: [],
    fontScale: 1,
  });

  const refresh = useCallback(async () => {
    const [attempts, quizzes, practiceDays, installedVersion, seenItems, lastSubtopic, fontScale] = await Promise.all([
      getAllAttempts(),
      getAllQuizzes(),
      getMeta<string[]>('practiceDays'),
      getMeta<string>('installedVersion'),
      getMeta<string[]>('seenItems'),
      getMeta<string>('lastSubtopic'),
      getMeta<number>('fontScale'),
    ]);
    setState({
      ready: true,
      attempts,
      quizzes,
      practiceDays: practiceDays ?? [],
      installedVersion: installedVersion ?? __APP_VERSION__,
      seenItems: seenItems ?? [],
      lastSubtopic,
      fontScale: fontScale ?? 1,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(state.fontScale));
  }, [state.fontScale]);

  const markSeen = useCallback(
    async (id: string) => {
      if (state.seenItems.includes(id)) return;
      const next = [...state.seenItems, id];
      await setMeta('seenItems', next);
      setState((s) => ({ ...s, seenItems: next }));
    },
    [state.seenItems],
  );

  const setLastSubtopic = useCallback(async (id: string) => {
    await setMeta('lastSubtopic', id);
    setState((s) => ({ ...s, lastSubtopic: id }));
  }, []);

  const setFontScale = useCallback(async (v: number) => {
    await setMeta('fontScale', v);
    setState((s) => ({ ...s, fontScale: v }));
  }, []);

  const bySubtopic = useMemo(() => groupBySubtopic(state.attempts), [state.attempts]);

  const value: Data = { ...state, bySubtopic, refresh, markSeen, setLastSubtopic, setFontScale };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData(): Data {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData outside DataProvider');
  return v;
}
