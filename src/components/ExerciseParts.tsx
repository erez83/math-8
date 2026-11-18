import type { Exercise, UserAnswer } from '../content/types';
import { checkAnswer, parseAnswer, type Verdict } from '../lib/answer';
import { MathText } from './MathText';
import { Keypad } from './Keypad';
import { ExerciseVisual } from './Visuals';

export function ExercisePrompt({ ex }: { ex: Exercise }) {
  return (
    <>
      <div className="question">
        <MathText text={ex.prompt} />
      </div>
      {ex.visual && <ExerciseVisual spec={ex.visual} />}
    </>
  );
}

export interface InputState {
  text: string;
  choice: number | null;
}

export const emptyInput: InputState = { text: '', choice: null };

/** Keypad or multiple choice, depending on the exercise. */
export function AnswerInput({
  ex,
  input,
  setInput,
  onSubmit,
  locked,
  reveal,
}: {
  ex: Exercise;
  input: InputState;
  setInput: (s: InputState) => void;
  onSubmit: (s?: InputState) => void;
  locked: boolean;
  /** After answering, color the right/wrong choice. */
  reveal?: boolean;
}) {
  if (ex.answer.kind === 'choice') {
    const correct = ex.answer.correct;
    return (
      <div className="choices">
        {ex.answer.options.map((opt, i) => {
          let cls = input.choice === i ? 'sel' : '';
          if (reveal && i === correct) cls = 'right';
          else if (reveal && input.choice === i) cls = 'wrong';
          return (
            <button
              key={i}
              className={cls}
              disabled={locked}
              onClick={() => {
                const next = { ...input, choice: i };
                setInput(next);
                onSubmit(next);
              }}
            >
              <MathText text={opt} />
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <Keypad
      value={input.text}
      onChange={(text) => setInput({ ...input, text })}
      onSubmit={() => onSubmit()}
      allowColon={ex.answer.kind === 'ratio'}
      unit={ex.answer.kind === 'number' ? ex.answer.unit : undefined}
      disabled={locked}
    />
  );
}

/** Parses and checks; returns the verdict plus the parsed answer (if valid). */
export function evaluate(ex: Exercise, input: InputState): { verdict: Verdict; user?: UserAnswer } {
  if (ex.answer.kind === 'choice') {
    if (input.choice === null) return { verdict: { status: 'invalid', feedback: 'בחרי תשובה' } };
    const user: UserAnswer = { kind: 'choice', index: input.choice };
    return { verdict: checkAnswer(user, ex.answer, ex.mistakes), user };
  }
  const parsed = parseAnswer(input.text, ex.answer);
  if ('error' in parsed) return { verdict: { status: 'invalid', feedback: parsed.error } };
  return { verdict: checkAnswer(parsed, ex.answer, ex.mistakes), user: parsed };
}

const PRAISE = ['מצוין!', 'נכון!', 'יפה מאוד!', 'בדיוק!', 'כל הכבוד!'];

export function Feedback({ verdict, seed = 0 }: { verdict: Verdict; seed?: number }) {
  if (verdict.status === 'correct') {
    return (
      <div className="feedback correct">
        <strong>{PRAISE[seed % PRAISE.length]}</strong>
      </div>
    );
  }
  const title = verdict.status === 'almost' ? 'כמעט!' : verdict.status === 'invalid' ? 'רגע…' : 'לא בדיוק.';
  return (
    <div className={`feedback ${verdict.status}`}>
      <strong>{title}</strong>
      {verdict.feedback && (
        <div className="fb-body">
          <MathText text={verdict.feedback} />
        </div>
      )}
    </div>
  );
}

export function Solution({ ex }: { ex: Exercise }) {
  return (
    <div className="solution">
      <strong>פתרון מלא</strong>
      <ol>
        {ex.solution.map((s, i) => (
          <li key={i}>
            <MathText text={s} />
          </li>
        ))}
      </ol>
    </div>
  );
}
