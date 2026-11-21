import { describe, expect, it } from 'vitest';
import { buildExam, levelMix, pickReview, unitOf } from '../src/lib/exam';
import { AVAILABLE_UNITS } from '../src/content/units';
import { groupBySubtopic } from '../src/lib/mastery';
import { makeRng } from '../src/lib/random';
import type { Attempt } from '../src/lib/db';

const DAY = 86_400_000;
const now = new Date(2026, 10, 21, 12).getTime();
const at = (sub: string, correct: boolean, daysAgo = 0, level: 1 | 2 | 3 = 2): Attempt => ({
  unitId: unitOf(sub), subtopicId: sub, level, correct, hintsUsed: 0, source: 'practice', ts: now - daysAgo * DAY,
});

describe('mixed exam', () => {
  it('has the requested length and a gentle level progression', () => {
    for (const n of [10, 15, 20]) {
      const lv = levelMix(n);
      expect(lv).toHaveLength(n);
      expect([...lv].sort()).toEqual(lv);
    }
  });

  it('spreads questions evenly over the chosen units', () => {
    const units = ['ratio', 'percent', 'pythagoras', 'statistics', 'volume'];
    for (let seed = 1; seed <= 50; seed++) {
      const ex = buildExam(units, 10, makeRng(seed));
      expect(ex).toHaveLength(10);
      const counts = new Map<string, number>();
      ex.forEach((e) => counts.set(unitOf(e.subtopicId), (counts.get(unitOf(e.subtopicId)) ?? 0) + 1));
      expect([...counts.keys()].sort()).toEqual([...units].sort());
      for (const c of counts.values()) expect(c).toBe(2);
    }
  });

  it('a unit quiz covers every subtopic of the unit', () => {
    const ex = buildExam(['equations'], 10, makeRng(7));
    const subs = new Set(ex.map((e) => e.subtopicId));
    expect(subs.size).toBe(AVAILABLE_UNITS.find((u) => u.id === 'equations')!.content!.subtopics.length);
  });

  it('works with all 13 units', () => {
    expect(buildExam(AVAILABLE_UNITS.map((u) => u.id), 20, makeRng(3))).toHaveLength(20);
  });
});

describe('daily review', () => {
  it('without history: new subtopics in book order', () => {
    const picks = pickReview(new Map(), 8, makeRng(1), now);
    expect(picks).toHaveLength(8);
    expect(picks.every((p) => p.reason === 'new')).toBe(true);
  });

  it('prefers weak subtopics, adds one new subtopic last', () => {
    const atts = [
      ...Array.from({ length: 6 }, () => at('percent.change', false, 1)),
      ...Array.from({ length: 6 }, () => at('ratio.concept', true, 1, 3)),
    ];
    const picks = pickReview(groupBySubtopic(atts), 8, makeRng(2), now);
    expect(picks).toHaveLength(8);
    expect(picks.filter((p) => p.subtopicId === 'percent.change').length).toBe(2);
    expect(picks[picks.length - 1].reason).toBe('new');
    expect(new Set(picks.map((p) => p.subtopicId)).size).toBeGreaterThan(3);
  });

  it('brings back strong subtopics that were not practiced for a long time', () => {
    const atts = AVAILABLE_UNITS.flatMap((u) =>
      u.content!.subtopics.flatMap((s, i) => Array.from({ length: 6 }, () => at(s.id, true, s.id === 'scale.area' ? 30 : i % 2, 3))),
    );
    const picks = pickReview(groupBySubtopic(atts), 8, makeRng(4), now);
    expect(picks.some((p) => p.subtopicId === 'scale.area')).toBe(true);
  });
});
