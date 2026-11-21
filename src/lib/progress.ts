/** Derived progress figures for the "My abilities" screen. Pure functions, easy to test. */
import type { Attempt, QuizResult } from './db';
import { computeStreak, dayKey } from './db';
import { subtopicMastery, unitMastery } from './mastery';
import type { Unit } from '../content/types';

const DAY = 86_400_000;

export interface DayActivity {
  key: string;
  label: string;
  total: number;
  correct: number;
}

const DAY_LETTERS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

/** Exercises per day for the last 7 days (oldest first). */
export function lastWeek(attempts: Attempt[], now = Date.now()): DayActivity[] {
  const days: DayActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const ts = now - i * DAY;
    days.push({ key: dayKey(ts), label: i === 0 ? 'היום' : DAY_LETTERS[new Date(ts).getDay()], total: 0, correct: 0 });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const a of attempts) {
    const d = byKey.get(dayKey(a.ts));
    if (d) {
      d.total++;
      if (a.correct) d.correct++;
    }
  }
  return days;
}

/** Subtopics whose mastery rose the most over the last 7 days. */
export function weeklyImprovements(units: Unit[], bySubtopic: Map<string, Attempt[]>, now = Date.now()) {
  const cutoff = now - 7 * DAY;
  const out: { id: string; title: string; unitTitle: string; before: number; after: number }[] = [];
  for (const u of units) {
    for (const s of u.content?.subtopics ?? []) {
      const all = bySubtopic.get(s.id) ?? [];
      const after = subtopicMastery(all);
      const before = subtopicMastery(all.filter((a) => a.ts < cutoff));
      if (after - before >= 5) out.push({ id: s.id, title: s.title, unitTitle: u.title, before, after });
    }
  }
  return out.sort((a, b) => b.after - b.before - (a.after - a.before)).slice(0, 3);
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  detail: string;
  earned: boolean;
}

export function achievements(
  units: Unit[],
  attempts: Attempt[],
  bySubtopic: Map<string, Attempt[]>,
  quizzes: QuizResult[],
  practiceDays: string[],
): Achievement[] {
  const available = units.filter((u) => u.content);
  const unitDone = available.some((u) => unitMastery(u.content!.subtopics.map((s) => s.id), bySubtopic) >= 80);
  const streak = Math.max(computeStreak(practiceDays), longestStreak(practiceDays));
  const correct = attempts.filter((a) => a.correct).length;
  const noHintHard = attempts.filter((a) => a.correct && a.level === 3 && a.hintsUsed === 0).length;
  return [
    { id: 'first', icon: '🌱', title: 'צעד ראשון', detail: 'פתרת תרגיל ראשון', earned: correct >= 1 },
    { id: 'fifty', icon: '🎯', title: '50 תשובות נכונות', detail: `${Math.min(correct, 50)}/50`, earned: correct >= 50 },
    { id: 'hard', icon: '🧗', title: 'מטפסת', detail: '10 תרגילים מאתגרים בלי רמזים', earned: noHintHard >= 10 },
    { id: 'streak3', icon: '🔥', title: '3 ימים ברצף', detail: 'תרגול 3 ימים רצופים', earned: streak >= 3 },
    { id: 'streak10', icon: '⚡', title: '10 ימים ברצף', detail: 'תרגול 10 ימים רצופים', earned: streak >= 10 },
    { id: 'unit', icon: '🏅', title: 'יחידה הושלמה', detail: 'שליטה של 80% ביחידה', earned: unitDone },
    { id: 'perfect', icon: '⭐', title: 'בוחן מושלם', detail: 'בוחן בלי אף טעות', earned: quizzes.some((q) => q.score === q.total) },
  ];
}

/** Longest run of consecutive practice days ever. */
export function longestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of sorted) {
    const [y, m, dd] = d.split('-').map(Number);
    const t = new Date(y, m - 1, dd).getTime();
    run = prev !== null && Math.round((t - prev) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}
