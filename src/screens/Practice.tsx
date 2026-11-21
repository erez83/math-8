import { useEffect, useMemo, useState } from 'react';
import type { Exercise, Level } from '../content/types';
import { getUnit } from '../content/units';
import { addAttempt } from '../lib/db';
import { suggestedLevel } from '../lib/mastery';
import { makeRng, pick, randomSeed } from '../lib/random';
import { back } from '../lib/router';
import { useData } from '../lib/store';
import { setBusy } from '../lib/update';
import type { Verdict } from '../lib/answer';
import { MathText } from '../components/MathText';
import { AnswerInput, emptyInput, evaluate, ExercisePrompt, Feedback, Solution, type InputState } from '../components/ExerciseParts';

type LevelChoice = 'auto' | Level;

/** The three hints walk through how to think, from understanding to a first step. */
const HINT_TITLES = ['מה שואלים?', 'איך חושבים?', 'הצעד הראשון'];
const HINT_ICONS = ['🔍', '💡', '👣'];

export function Practice({ unitId, subtopicId }: { unitId: string; subtopicId: string }) {
  const unit = getUnit(unitId);
  const data = useData();
  const subtopics = unit?.content?.subtopics ?? [];
  const fixed = subtopics.find((s) => s.id === subtopicId);

  const [levelChoice, setLevelChoice] = useState<LevelChoice>('auto');
  const [ex, setEx] = useState<Exercise | null>(null);
  const [input, setInput] = useState<InputState>(emptyInput);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [finished, setFinished] = useState(false);
  const [session, setSession] = useState({ right: 0, total: 0 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    setBusy(true);
    return () => setBusy(false);
  }, []);

  const newExercise = (choice: LevelChoice = levelChoice) => {
    const rng = makeRng(randomSeed());
    const sub = fixed ?? pick(rng, subtopics);
    if (!sub) return;
    const level: Level = choice === 'auto' ? suggestedLevel(data.bySubtopic.get(sub.id) ?? []) : choice;
    setEx(sub.generate(level, rng));
    setInput(emptyInput);
    setVerdict(null);
    setHints(0);
    setShowSolution(false);
    setRecorded(false);
    setFinished(false);
    setCount((c) => c + 1);
    data.setLastSubtopic(sub.id);
  };

  // First exercise once data is loaded.
  useEffect(() => {
    if (data.ready && !ex) newExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.ready]);

  const record = async (correct: boolean) => {
    if (recorded || !ex) return;
    setRecorded(true);
    setSession((s) => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }));
    await addAttempt({ unitId, subtopicId: ex.subtopicId, level: ex.level, correct, hintsUsed: hints, source: 'practice', ts: Date.now() });
    await data.refresh();
  };

  const submit = (override?: InputState) => {
    if (!ex || finished) return;
    const { verdict: v } = evaluate(ex, override ?? input);
    setVerdict(v);
    if (v.status === 'correct') {
      record(true);
      setFinished(true);
    } else if (v.status === 'wrong') {
      record(false);
      if (ex.answer.kind === 'choice') setFinished(true);
    }
  };

  const reveal = () => {
    record(false);
    setShowSolution(true);
    setFinished(true);
  };

  const subTitle = useMemo(() => (ex ? subtopics.find((s) => s.id === ex.subtopicId)?.title : ''), [ex, subtopics]);

  if (!unit?.content) return <p>היחידה לא נמצאה.</p>;

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back(`/unit/${unitId}`)} aria-label="חזרה">
          → חזרה
        </button>
        <h1>{fixed ? fixed.title : `תרגול מעורב: ${unit.title}`}</h1>
        <span className="session">
          {session.right}/{session.total}
        </span>
      </div>

      <div className="levelbar">
        <div className="seg" role="tablist" aria-label="רמת קושי">
          {(['auto', 1, 2, 3] as LevelChoice[]).map((l) => (
            <button
              key={l}
              className={levelChoice === l ? 'on' : ''}
              onClick={() => {
                setLevelChoice(l);
                newExercise(l);
              }}
            >
              {l === 'auto' ? 'אוטומטי' : l === 1 ? 'בסיסי' : l === 2 ? 'בינוני' : 'מאתגר'}
            </button>
          ))}
        </div>
      </div>

      {ex && (
        <div className="card" key={count}>
          <div className="muted small" style={{ marginBottom: 6 }}>
            {!fixed && subTitle ? `${subTitle} · ` : ''}
            רמה {ex.level === 1 ? 'בסיסית' : ex.level === 2 ? 'בינונית' : 'מאתגרת'}
          </div>
          <ExercisePrompt ex={ex} />

          {Array.from({ length: hints }, (_, i) => (
            <div className="hint" key={i}>
              <div className="hint-title">
                {HINT_ICONS[i]} {HINT_TITLES[i]}
              </div>
              <MathText text={ex.hints[i]} />
            </div>
          ))}

          {verdict && <Feedback verdict={verdict} seed={count} />}
          {showSolution && <Solution ex={ex} />}

          <AnswerInput ex={ex} input={input} setInput={setInput} onSubmit={submit} locked={finished} reveal={finished} />

          <div className="btn-row" style={{ marginTop: 12 }}>
            {!finished && hints < ex.hints.length && (
              <button className="btn secondary" onClick={() => setHints(hints + 1)}>
                {hints === 0 ? 'רמז: ' : 'רמז הבא: '}
                {HINT_TITLES[hints]}
              </button>
            )}
            {!finished && (
              <button className="btn ghost" onClick={reveal}>
                הראי פתרון
              </button>
            )}
            {finished && !showSolution && verdict?.status !== 'correct' && (
              <button className="btn ghost" onClick={() => setShowSolution(true)}>
                הראי פתרון
              </button>
            )}
            {finished && (
              <button className="btn" onClick={() => newExercise()}>
                התרגיל הבא ←
              </button>
            )}
          </div>
          {finished && verdict?.status === 'correct' && !showSolution && (
            <button className="icon-btn small" style={{ marginTop: 6 }} onClick={() => setShowSolution(true)}>
              איך פותרים? הראי את הדרך
            </button>
          )}
        </div>
      )}
    </div>
  );
}
