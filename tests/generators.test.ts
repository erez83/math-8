import { describe, expect, it } from 'vitest';
import { AVAILABLE_UNITS, UNITS } from '../src/content/units';
import type { Exercise, Level, UserAnswer } from '../src/content/types';
import { checkAnswer, formatAnswer, parseAnswer } from '../src/lib/answer';
import { makeRng } from '../src/lib/random';

const SEEDS = 400;

function correctUserAnswer(ex: Exercise): UserAnswer {
  const a = ex.answer;
  if (a.kind === 'choice') return { kind: 'choice', index: a.correct };
  if (a.kind === 'ratio') return { kind: 'ratio', parts: a.parts };
  return { kind: 'number', value: a.value };
}

describe('content registry', () => {
  it('has 13 units with unique, stable ids', () => {
    expect(UNITS).toHaveLength(13);
    expect(new Set(UNITS.map((u) => u.id)).size).toBe(13);
    const subIds = AVAILABLE_UNITS.flatMap((u) => u.content!.subtopics.map((s) => s.id));
    expect(new Set(subIds).size).toBe(subIds.length);
    for (const u of AVAILABLE_UNITS) for (const s of u.content!.subtopics) expect(s.id.startsWith(u.id + '.')).toBe(true);
  });

  it('every subtopic has at least two explanations', () => {
    for (const u of AVAILABLE_UNITS) for (const s of u.content!.subtopics) expect(s.explanations.length).toBeGreaterThanOrEqual(2);
  });
});

for (const unit of AVAILABLE_UNITS) {
  for (const sub of unit.content!.subtopics) {
    describe(sub.id, () => {
      for (const level of [1, 2, 3] as Level[]) {
        it(`level ${level}: ${SEEDS} generated exercises are valid`, () => {
          for (let seed = 1; seed <= SEEDS; seed++) {
            const ex = sub.generate(level, makeRng(seed * 31 + level));
            const ctx = `${sub.id} L${level} seed ${seed}: ${ex.prompt}`;
            expect(ex.subtopicId, ctx).toBe(sub.id);
            expect(ex.level, ctx).toBe(level);
            expect(ex.hints, ctx).toHaveLength(3);
            // Hints guide the thinking; they must never contain the final answer as a full result.
            for (const h of ex.hints) expect(h.trim().length, ctx).toBeGreaterThan(10);
            expect(ex.solution.length, ctx).toBeGreaterThan(0);
            const text = [ex.prompt, ...ex.hints, ...ex.solution].join(' ');
            expect(text, ctx).not.toMatch(/NaN|undefined|Infinity/);

            const a = ex.answer;
            if (a.kind === 'number') {
              expect(Number.isFinite(a.value), ctx).toBe(true);
              // Answers must be "nice": whole numbers or at most 2 decimal places.
              // (Fractions like 5/12 are fine when the answer has a fraction display.)
              if (!a.display) expect(Math.abs(a.value * 100 - Math.round(a.value * 100)) < 1e-6, ctx).toBe(true);
            }
            if (a.kind === 'ratio') {
              for (const p of a.parts) expect(Number.isInteger(p) && p > 0, ctx).toBe(true);
            }
            if (a.kind === 'choice') {
              expect(a.correct, ctx).toBeGreaterThanOrEqual(0);
              expect(new Set(a.options).size, ctx).toBe(a.options.length);
            }

            // The correct answer is accepted…
            const right = correctUserAnswer(ex);
            expect(checkAnswer(right, a, ex.mistakes).status, ctx).toBe('correct');
            // …also when typed on the keypad.
            if (a.kind !== 'choice') {
              const typed = parseAnswer(a.kind === 'number' ? a.display ?? String(a.value) : formatAnswer(a), a);
              expect('error' in typed, ctx).toBe(false);
              expect(checkAnswer(typed as UserAnswer, a, ex.mistakes).status, ctx).toBe('correct');
            }
            // No "common mistake" may match the correct answer.
            for (const mk of ex.mistakes) expect(mk.matches(right), ctx).toBe(false);
          }
        });
      }
    });
  }
}
