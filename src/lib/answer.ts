import type { AnswerSpec, CommonMistake, UserAnswer } from '../content/types';
import { gcdAll } from './random';

export type Verdict =
  | { status: 'correct' }
  | { status: 'almost'; feedback: string }
  | { status: 'wrong'; feedback?: string }
  | { status: 'invalid'; feedback: string };

/** Parses keypad text into a UserAnswer for the expected answer kind. */
export function parseAnswer(text: string, spec: AnswerSpec): UserAnswer | { error: string } {
  const t = text.trim();
  if (spec.kind === 'choice') return { error: 'בחרי תשובה' };
  if (!t) return { error: 'עוד לא כתבת תשובה' };

  if (spec.kind === 'ratio') {
    const pieces = t.split(':');
    if (pieces.length !== spec.parts.length) {
      return {
        error:
          spec.parts.length === 3
            ? 'כתבי יחס של שלושה מספרים, למשל 2:3:5'
            : 'כתבי יחס של שני מספרים עם נקודתיים, למשל 2:3',
      };
    }
    const parts = pieces.map(parseNumber);
    if (parts.some((p) => p === null)) return { error: 'אחד המספרים ביחס לא תקין' };
    return { kind: 'ratio', parts: parts as number[] };
  }

  if (t.includes(':')) return { error: 'כאן צריך מספר אחד, לא יחס' };
  const value = parseNumber(t);
  if (value === null) return { error: 'המספר לא תקין' };
  return { kind: 'number', value };
}

/** Accepts integers, decimals and simple fractions like 3/4. */
export function parseNumber(s: string): number | null {
  const t = s.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  const m = /^(-?\d+)\/(\d+)$/.exec(t);
  if (m && Number(m[2]) !== 0) return Number(m[1]) / Number(m[2]);
  return null;
}

const EPS = 1e-9;

function ratiosEquivalent(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  // a[i]/b[i] must be the same positive constant for every i.
  const k = a[0] / b[0];
  if (!(k > 0) || !isFinite(k)) return false;
  return a.every((x, i) => Math.abs(x - k * b[i]) < EPS * Math.max(1, Math.abs(x)));
}

function isSimplest(parts: number[]): boolean {
  return parts.every((p) => Number.isInteger(p) && p > 0) && gcdAll(parts) === 1;
}

export function checkAnswer(user: UserAnswer, spec: AnswerSpec, mistakes: CommonMistake[] = []): Verdict {
  let correct = false;
  if (spec.kind === 'number' && user.kind === 'number') {
    const tol = spec.tolerance ?? 1e-6 * Math.max(1, Math.abs(spec.value));
    correct = Math.abs(user.value - spec.value) <= tol + 1e-9;
  } else if (spec.kind === 'choice' && user.kind === 'choice') {
    correct = user.index === spec.correct;
  } else if (spec.kind === 'ratio' && user.kind === 'ratio') {
    const exact = user.parts.every((p, i) => Math.abs(p - spec.parts[i]) < EPS);
    if (exact) {
      correct = true;
    } else if (spec.acceptEquivalent !== false && ratiosEquivalent(user.parts, spec.parts)) {
      if (spec.requireSimplest && !isSimplest(user.parts)) {
        return { status: 'almost', feedback: 'היחס נכון, אבל אפשר לצמצם אותו עוד. נסי לחלק את כל המספרים במחלק משותף.' };
      }
      correct = true;
    } else if (ratiosEquivalent(user.parts, [...spec.parts].reverse())) {
      return { status: 'wrong', feedback: 'הסדר הפוך. ביחס, הסדר של המספרים חייב להתאים לסדר שבשאלה.' };
    }
  }
  if (correct) return { status: 'correct' };
  const known = mistakes.find((m) => m.matches(user));
  return { status: 'wrong', feedback: known?.feedback };
}

/** Formats an AnswerSpec's correct answer for display. */
export function formatAnswer(spec: AnswerSpec): string {
  switch (spec.kind) {
    case 'number':
      return `${spec.display ?? fmt(spec.value)}${spec.unit ? ' ' + spec.unit : ''}`;
    case 'ratio':
      return spec.parts.map(fmt).join(':');
    case 'choice':
      return spec.options[spec.correct];
  }
}

export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
}
