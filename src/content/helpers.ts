import type { CommonMistake, UserAnswer } from './types';
import type { Rng } from '../lib/random';
import { pick } from '../lib/random';

/** Wraps math so it renders left-to-right inside Hebrew text. */
export const m = (s: string | number) => `{{${s}}}`;
export const r = (...parts: number[]) => m(parts.join(':'));

export const isNum = (v: number) => (a: UserAnswer) =>
  a.kind === 'number' && Math.abs(a.value - v) < 1e-6 * Math.max(1, Math.abs(v));

export const isRatio = (parts: number[]) => (a: UserAnswer) =>
  a.kind === 'ratio' && a.parts.length === parts.length && a.parts.every((p, i) => p === parts[i]);

/** Builds a mistake list, skipping any mistake whose value equals the correct answer. */
export function mistakes(correct: (a: UserAnswer) => boolean, list: CommonMistake[]): CommonMistake[] {
  return list.filter((mk) => {
    // A "mistake" that equals the right answer would mislabel a correct answer.
    const probe = probes(mk);
    return !probe.some(correct);
  });
}

// Mistake matchers are closures; we can't introspect them, so we keep the
// value alongside when building with numMistake/ratioMistake below.
const PROBE = Symbol('probe');
type Probed = CommonMistake & { [PROBE]?: UserAnswer };
function probes(mk: Probed): UserAnswer[] {
  return mk[PROBE] ? [mk[PROBE]] : [];
}

export function numMistake(value: number, feedback: string): CommonMistake {
  const mk: Probed = { matches: isNum(value), feedback };
  mk[PROBE] = { kind: 'number', value };
  return mk;
}

export function ratioMistake(parts: number[], feedback: string): CommonMistake {
  const mk: Probed = { matches: isRatio(parts), feedback };
  mk[PROBE] = { kind: 'ratio', parts };
  return mk;
}

export const MINUS = '−';

/** Signed number with a real minus sign: −3 */
export const sgn = (n: number) => (n < 0 ? `${MINUS}${-n}` : String(n));

/** "y = 2x + 3", "y = −x", "y = 4", "y = 0.5x − 1" */
export function lineText(mm: number, b: number): string {
  const mx = mm === 0 ? '' : mm === 1 ? 'x' : mm === -1 ? `${MINUS}x` : `${sgn(mm)}x`;
  if (!mx) return `y = ${sgn(b)}`;
  return b === 0 ? `y = ${mx}` : `y = ${mx} ${b > 0 ? '+' : MINUS} ${Math.abs(b)}`;
}

/** "(2, −3)" */
export const pt = (x: number, y: number) => `(${sgn(x)}, ${sgn(y)})`;

export const PAIRS: [string, string][] = [
  ['נועה', 'איתי'],
  ['מאיה', 'עומר'],
  ['שירה', 'יונתן'],
  ['טל', 'רון'],
  ['יעל', 'אורי'],
  ['ליה', 'דניאל'],
];

export const TRIOS: [string, string, string][] = [
  ['נועה', 'איתי', 'מאיה'],
  ['שירה', 'רון', 'יעל'],
  ['טל', 'אורי', 'ליה'],
];

export function pickPair(rng: Rng) {
  return pick(rng, PAIRS);
}
