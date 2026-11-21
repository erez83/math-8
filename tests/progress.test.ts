import { describe, expect, it } from 'vitest';
import { lastWeek, longestStreak, weeklyImprovements, achievements } from '../src/lib/progress';
import { groupBySubtopic } from '../src/lib/mastery';
import { UNITS } from '../src/content/units';
import type { Attempt } from '../src/lib/db';

const DAY = 86_400_000;
const now = new Date(2026, 10, 21, 12).getTime();
const at = (daysAgo: number, correct: boolean, sub = 'ratio.concept', level: 1 | 2 | 3 = 2): Attempt => ({
  unitId: 'ratio', subtopicId: sub, level, correct, hintsUsed: 0, source: 'practice', ts: now - daysAgo * DAY,
});

describe('progress screen data', () => {
  it('counts the last 7 days, today last', () => {
    const w = lastWeek([at(0, true), at(0, false), at(2, true), at(9, true)], now);
    expect(w).toHaveLength(7);
    expect(w[6]).toMatchObject({ label: 'היום', total: 2, correct: 1 });
    expect(w[4]).toMatchObject({ total: 1, correct: 1 });
    expect(w.reduce((s, d) => s + d.total, 0)).toBe(3); // 9 days ago is outside
  });

  it('finds this week’s improvement', () => {
    const old = Array.from({ length: 6 }, () => at(10, false));
    const fresh = Array.from({ length: 6 }, () => at(1, true));
    const imp = weeklyImprovements(UNITS, groupBySubtopic([...old, ...fresh]), now);
    expect(imp[0].id).toBe('ratio.concept');
    expect(imp[0].after).toBeGreaterThan(imp[0].before);
  });

  it('longest streak', () => {
    expect(longestStreak(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-10'])).toBe(3);
    expect(longestStreak([])).toBe(0);
  });

  it('achievements', () => {
    const atts = [at(0, true)];
    const a = achievements(UNITS, atts, groupBySubtopic(atts), [{ unitIds: ['ratio'], score: 10, total: 10, ts: now }], []);
    expect(a.find((x) => x.id === 'first')?.earned).toBe(true);
    expect(a.find((x) => x.id === 'perfect')?.earned).toBe(true);
    expect(a.find((x) => x.id === 'fifty')?.earned).toBe(false);
  });
});
