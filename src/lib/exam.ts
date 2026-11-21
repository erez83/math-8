/** Building exams and the daily review. Pure functions, so they are easy to test. */
import type { Exercise, Level, Subtopic } from '../content/types';
import { AVAILABLE_UNITS, getUnit } from '../content/units';
import type { Attempt } from './db';
import { subtopicMastery, suggestedLevel } from './mastery';
import { shuffle, type Rng } from './random';

/** Unit id of a subtopic id ("ratio-divide.basic" → "ratio-divide"). */
export const unitOf = (subtopicId: string) => subtopicId.split('.')[0];

/** About 30% basic, 40% medium, 30% challenging, easy first. */
export function levelMix(n: number): Level[] {
  const l1 = Math.round(n * 0.3);
  const l3 = Math.round(n * 0.3);
  return [...Array(l1).fill(1), ...Array(n - l1 - l3).fill(2), ...Array(l3).fill(3)] as Level[];
}

/**
 * Exam questions spread evenly across the chosen units and their subtopics.
 * Units take turns, so a 10-question exam on 5 units has 2 questions from each.
 */
export function buildExam(unitIds: string[], n: number, rng: Rng): Exercise[] {
  const units = unitIds.map(getUnit).filter((u) => u?.content);
  if (units.length === 0) return [];
  const queues = new Map<string, Subtopic[]>();
  const nextSub = (unitId: string): Subtopic => {
    let q = queues.get(unitId);
    if (!q || q.length === 0) {
      q = shuffle(rng, getUnit(unitId)!.content!.subtopics);
      queues.set(unitId, q);
    }
    return q.shift()!;
  };
  const unitOrder = shuffle(rng, units.map((u) => u!.id));
  const levels = levelMix(n);
  const subs = levels.map((_, i) => nextSub(unitOrder[i % unitOrder.length]));
  // Shuffle topics but keep the gentle level progression.
  const mixed = shuffle(rng, subs);
  return levels.map((level, i) => mixed[i].generate(level, rng));
}

export interface ReviewPick {
  unitId: string;
  subtopicId: string;
  reason: 'weak' | 'stale' | 'new';
}

const DAY = 86_400_000;

/**
 * Daily review: mostly weak subtopics, some that were not practiced for a while
 * (so they are not forgotten), and one new subtopic to keep moving forward.
 */
export function pickReview(bySubtopic: Map<string, Attempt[]>, count: number, rng: Rng, now = Date.now()): ReviewPick[] {
  const all = AVAILABLE_UNITS.flatMap((u) => u.content!.subtopics.map((s) => ({ unitId: u.id, subtopicId: s.id })));
  const started = all
    .map((x) => {
      const atts = bySubtopic.get(x.subtopicId) ?? [];
      if (atts.length === 0) return null;
      const mastery = subtopicMastery(atts);
      const last = Math.max(...atts.map((a) => a.ts));
      const days = (now - last) / DAY;
      // Weak topics first; forgotten ones climb up over time.
      const priority = (100 - mastery) + Math.min(40, days * 4) + rng() * 10;
      return { ...x, mastery, days, priority };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.priority - a.priority);

  const picks: ReviewPick[] = [];
  const used = new Map<string, number>();
  const add = (x: { unitId: string; subtopicId: string }, reason: ReviewPick['reason']) => {
    picks.push({ ...x, reason });
    used.set(x.subtopicId, (used.get(x.subtopicId) ?? 0) + 1);
  };

  // One new subtopic (the first not yet tried, in book order).
  const fresh = all.find((x) => !bySubtopic.get(x.subtopicId)?.length);
  const slots = fresh ? count - 1 : count;

  // Up to two rounds over the prioritized list, so a very weak topic can appear twice.
  for (let round = 0; round < 2 && picks.length < slots; round++) {
    for (const x of started) {
      if (picks.length >= slots) break;
      if (round === 1 && x.mastery >= 70) continue;
      add(x, x.mastery < 70 ? 'weak' : 'stale');
    }
  }
  // Not enough history yet: fill with new subtopics in book order.
  for (const x of all) {
    if (picks.length >= slots) break;
    if (!used.has(x.subtopicId) && x !== fresh) add(x, 'new');
  }
  // Review first (mixed), and the new subtopic last, as a small step forward.
  const result = shuffle(rng, picks);
  if (fresh) result.push({ ...fresh, reason: 'new' });
  return result;
}

export function reviewLevel(bySubtopic: Map<string, Attempt[]>, subtopicId: string): Level {
  return suggestedLevel(bySubtopic.get(subtopicId) ?? []);
}
