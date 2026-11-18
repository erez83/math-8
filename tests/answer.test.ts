import { describe, expect, it } from 'vitest';
import { checkAnswer, parseAnswer } from '../src/lib/answer';
import { computeStreak } from '../src/lib/db';
import { subtopicMastery, tierOf } from '../src/lib/mastery';

describe('answers', () => {
  it('parses numbers, fractions and ratios', () => {
    expect(parseAnswer('12', { kind: 'number', value: 12 })).toEqual({ kind: 'number', value: 12 });
    expect(parseAnswer('3/8', { kind: 'number', value: 0.375 })).toEqual({ kind: 'number', value: 0.375 });
    expect(parseAnswer('2:3', { kind: 'ratio', parts: [2, 3] })).toEqual({ kind: 'ratio', parts: [2, 3] });
    expect('error' in parseAnswer('2:3', { kind: 'number', value: 1 })).toBe(true);
    expect('error' in parseAnswer('2', { kind: 'ratio', parts: [2, 3] })).toBe(true);
  });

  it('accepts equivalent ratios unless the simplest form is required', () => {
    expect(checkAnswer({ kind: 'ratio', parts: [4, 6] }, { kind: 'ratio', parts: [2, 3] }).status).toBe('correct');
    expect(checkAnswer({ kind: 'ratio', parts: [4, 6] }, { kind: 'ratio', parts: [2, 3], requireSimplest: true }).status).toBe('almost');
    expect(checkAnswer({ kind: 'ratio', parts: [4, 6] }, { kind: 'ratio', parts: [8, 12], acceptEquivalent: false }).status).toBe('wrong');
  });

  it('explains a reversed ratio', () => {
    const v = checkAnswer({ kind: 'ratio', parts: [3, 2] }, { kind: 'ratio', parts: [2, 3] });
    expect(v.status).toBe('wrong');
    expect(v.status === 'wrong' && v.feedback).toContain('הפוך');
  });
});

describe('progress', () => {
  const at = (correct: boolean, level: 1 | 2 | 3, hintsUsed = 0, ts = 0) => ({
    unitId: 'ratio', subtopicId: 'ratio.concept', level, correct, hintsUsed, source: 'practice' as const, ts,
  });

  it('mastery grows with correct answers and needs a few attempts', () => {
    expect(subtopicMastery([])).toBe(0);
    expect(subtopicMastery([at(true, 3)])).toBeLessThan(30);
    const ten = Array.from({ length: 10 }, (_, i) => at(true, 3, 0, i));
    expect(subtopicMastery(ten)).toBe(100);
    expect(tierOf(100).name).toBe('מומחית');
  });

  it('streak counts consecutive days', () => {
    const now = new Date(2026, 10, 18, 12).getTime();
    expect(computeStreak(['2026-11-16', '2026-11-17', '2026-11-18'], now)).toBe(3);
    expect(computeStreak(['2026-11-16', '2026-11-17'], now)).toBe(2); // today not practiced yet
    expect(computeStreak(['2026-11-15'], now)).toBe(0);
  });
});
