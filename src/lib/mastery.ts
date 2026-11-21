import type { Attempt } from './db';

/** How many recent attempts count toward mastery. */
const WINDOW = 10;
/** Attempts needed before mastery can reach its full value. */
const FULL_CONFIDENCE = 6;

const LEVEL_WEIGHT = { 1: 0.7, 2: 0.9, 3: 1 } as const;

function attemptScore(a: Attempt): number {
  if (!a.correct) return 0;
  const hintFactor = [1, 0.8, 0.6, 0.4][Math.min(a.hintsUsed, 3)];
  return LEVEL_WEIGHT[a.level] * hintFactor;
}

/** Mastery 0–100 for one subtopic, from its attempts (any order). */
export function subtopicMastery(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const recent = [...attempts].sort((a, b) => a.ts - b.ts).slice(-WINDOW);
  const avg = recent.reduce((s, a) => s + attemptScore(a), 0) / recent.length;
  const confidence = Math.min(1, recent.length / FULL_CONFIDENCE);
  return Math.round(100 * avg * confidence);
}

export function unitMastery(subtopicIds: string[], bySubtopic: Map<string, Attempt[]>): number {
  if (subtopicIds.length === 0) return 0;
  const sum = subtopicIds.reduce((s, id) => s + subtopicMastery(bySubtopic.get(id) ?? []), 0);
  return Math.round(sum / subtopicIds.length);
}

export function groupBySubtopic(attempts: Attempt[]): Map<string, Attempt[]> {
  const m = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const list = m.get(a.subtopicId) ?? [];
    list.push(a);
    m.set(a.subtopicId, list);
  }
  return m;
}

export type Tier = { name: string; key: 'start' | 'way' | 'good' | 'expert' };

export function tierOf(mastery: number): Tier {
  if (mastery >= 90) return { name: 'מומחית', key: 'expert' };
  if (mastery >= 70) return { name: 'שולטת', key: 'good' };
  if (mastery >= 40) return { name: 'בדרך', key: 'way' };
  return { name: 'מתחילה', key: 'start' };
}

/** Suggested level for the next exercise, from recent results. */
export function suggestedLevel(attempts: Attempt[]): 1 | 2 | 3 {
  const m = subtopicMastery(attempts);
  if (m >= 70) return 3;
  if (m >= 40) return 2;
  return 1;
}
