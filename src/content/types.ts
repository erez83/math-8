import type { Rng } from '../lib/random';

export type Level = 1 | 2 | 3;

/** What the student must enter. */
export type AnswerSpec =
  | { kind: 'number'; value: number; unit?: string; /** e.g. "3/8" when the answer is a fraction */ display?: string }
  | {
      kind: 'ratio';
      parts: number[];
      /** If true, an equivalent but not fully simplified ratio is "almost". */
      requireSimplest?: boolean;
      /** If false, only these exact numbers are accepted (e.g. "fill in the expanded ratio"). */
      acceptEquivalent?: boolean;
    }
  | { kind: 'choice'; options: string[]; correct: number };

/** A user answer, already parsed from the keypad. */
export type UserAnswer =
  | { kind: 'number'; value: number }
  | { kind: 'ratio'; parts: number[] }
  | { kind: 'choice'; index: number };

export interface CommonMistake {
  /** Returns true when the user's answer matches this known mistake. */
  matches: (a: UserAnswer) => boolean;
  feedback: string;
}

export type VisualSpec =
  | { type: 'bars'; groups: { label: string; count: number; color: 'a' | 'b' | 'c' }[] }
  | { type: 'barModel'; parts: number[]; labels: string[]; total?: number; perBox?: number };

export interface Exercise {
  subtopicId: string;
  level: Level;
  /** Text. Wrap math in {{...}} so it renders left-to-right. */
  prompt: string;
  answer: AnswerSpec;
  hints: [string, string];
  /** Full solution, step by step. */
  solution: string[];
  mistakes: CommonMistake[];
  visual?: VisualSpec;
}

export type Generator = (level: Level, rng: Rng) => Exercise;

export interface ExplanationVariant {
  /** Short label for the "explain differently" switcher. */
  label: string;
  title: string;
  paragraphs: string[];
  /** Interactive visual shown with this explanation. */
  interactive?: 'smoothie' | 'zoom' | 'boxes';
  /** Worked example, step by step. */
  example?: { question: string; steps: string[] };
}

export interface Subtopic {
  /** Stable ID. NEVER change it — progress is stored by it. */
  id: string;
  title: string;
  /** App version that added it (for the "new" tag). */
  addedIn: string;
  explanations: ExplanationVariant[];
  generate: Generator;
}

export interface UnitContent {
  hook: { title: string; text: string };
  tricks: string[];
  commonMistakes: { title: string; text: string }[];
  subtopics: Subtopic[];
}

export interface Unit {
  /** Stable ID. NEVER change it. */
  id: string;
  number: number;
  title: string;
  bookRef: string;
  addedIn?: string;
  /** Missing while the unit is "coming soon". */
  content?: UnitContent;
}
