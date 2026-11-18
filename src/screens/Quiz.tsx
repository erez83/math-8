import { useEffect, useState } from 'react';
import type { Exercise, Level } from '../content/types';
import { getUnit } from '../content/units';
import { addAttempt, addQuiz } from '../lib/db';
import { makeRng, randomSeed, shuffle } from '../lib/random';
import { back, go } from '../lib/router';
import { useData } from '../lib/store';
import { setBusy } from '../lib/update';
import { formatAnswer, type Verdict } from '../lib/answer';
import { MathText } from '../components/MathText';
import { AnswerInput, emptyInput, evaluate, ExercisePrompt, Feedback, Solution, type InputState } from '../components/ExerciseParts';

const LEVELS: Level[] = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3];

interface Item {
  ex: Exercise;
  input: InputState;
  verdict: Verdict | null; // final verdict once answered
  almostShown: boolean;
}

function buildQuiz(unitId: string): Item[] {
  const unit = getUnit(unitId);
  const subs = unit?.content?.subtopics ?? [];
  const rng = makeRng(randomSeed());
  let order = shuffle(rng, subs);
  return LEVELS.map((level, i) => {
    if (i > 0 && i % order.length === 0) order = shuffle(rng, subs);
    const sub = order[i % order.length];
    return { ex: sub.generate(level, rng), input: emptyInput, verdict: null, almostShown: false };
  });
}

export function Quiz({ unitId }: { unitId: string }) {
  const unit = getUnit(unitId);
  const data = useData();
  const [items, setItems] = useState<Item[]>(() => buildQuiz(unitId));
  const [cur, setCur] = useState(0);
  const [note, setNote] = useState<Verdict | null>(null);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    setBusy(!done);
    return () => setBusy(false);
  }, [done]);

  if (!unit?.content) return <p>היחידה לא נמצאה.</p>;

  const item = items[cur];
  const answered = items.filter((it) => it.verdict).length;

  const update = (i: number, patch: Partial<Item>) => setItems((list) => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const nextUnanswered = (from: number) => {
    for (let s = 1; s <= items.length; s++) {
      const j = (from + s) % items.length;
      if (!items[j].verdict && j !== from) return j;
    }
    return from;
  };

  const submit = (override?: InputState) => {
    const input = override ?? item.input;
    const { verdict } = evaluate(item.ex, input);
    if (verdict.status === 'invalid') return setNote(verdict);
    // One free fix for "almost" (e.g. not fully simplified), like a teacher would allow.
    if (verdict.status === 'almost' && !item.almostShown) {
      update(cur, { input, almostShown: true });
      return setNote(verdict);
    }
    update(cur, { input, verdict });
    setNote(null);
    setCur(nextUnanswered(cur));
  };

  const finish = async () => {
    const final = items.map((it) => (it.verdict ? it : { ...it, verdict: { status: 'wrong' } as Verdict }));
    setItems(final);
    const score = final.filter((it) => it.verdict?.status === 'correct').length;
    const ts = Date.now();
    for (const it of final) {
      await addAttempt({ unitId, subtopicId: it.ex.subtopicId, level: it.ex.level, correct: it.verdict?.status === 'correct', hintsUsed: 0, source: 'quiz', ts });
    }
    await addQuiz({ unitIds: [unitId], score, total: final.length, ts });
    await data.refresh();
    setDone(true);
    window.scrollTo(0, 0);
  };

  if (done) {
    const score = items.filter((it) => it.verdict?.status === 'correct').length;
    return (
      <div>
        <div className="topbar">
          <button className="icon-btn" onClick={() => go(`/unit/${unitId}`)}>→ ליחידה</button>
          <h1>תוצאות הבוחן</h1>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="score-big">
            {score}/{items.length}
          </div>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            {score === items.length ? 'בוחן מושלם. מרשים!' : score >= 8 ? 'תוצאה מצוינת.' : score >= 6 ? 'יפה. כדאי לעבור על הטעויות למטה.' : 'שווה לחזור על ההסברים ולתרגל עוד קצת. את בדרך.'}
          </p>
        </div>
        <div className="section-title">מעבר על השאלות</div>
        <div className="list">
          {items.map((it, i) => {
            const ok = it.verdict?.status === 'correct';
            return (
              <div className="card" key={i} style={{ marginBottom: 0 }}>
                <div className="muted small">
                  שאלה {i + 1} · {ok ? '✓ נכון' : '✗ לא נכון'}
                </div>
                <ExercisePrompt ex={it.ex} />
                {!ok && (
                  <>
                    <p className="small" style={{ margin: '8px 0 0' }}>
                      התשובה הנכונה: <MathText text={`{{${formatAnswer(it.ex.answer)}}}`} />
                    </p>
                    {it.verdict && it.verdict.status !== 'correct' && it.verdict.feedback && <Feedback verdict={it.verdict} />}
                  </>
                )}
                {open === i ? (
                  <Solution ex={it.ex} />
                ) : (
                  <button className="icon-btn small" onClick={() => setOpen(i)}>
                    הראי פתרון מלא
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn secondary" onClick={() => go(`/practice/${unitId}/all`)}>
            לתרגול
          </button>
          <button
            className="btn"
            onClick={() => {
              setItems(buildQuiz(unitId));
              setCur(0);
              setDone(false);
              setOpen(null);
            }}
          >
            בוחן חדש
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back(`/unit/${unitId}`)}>→ יציאה</button>
        <h1>בוחן: {unit.title}</h1>
        <span className="session">
          {answered}/{items.length}
        </span>
      </div>
      <div className="quiz-dots">
        {items.map((it, i) => (
          <button key={i} className={`${it.verdict ? 'done' : ''} ${i === cur ? 'cur' : ''}`} onClick={() => { setCur(i); setNote(null); }}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="card" key={cur}>
        <div className="muted small" style={{ marginBottom: 6 }}>
          שאלה {cur + 1} מתוך {items.length}
          {item.verdict && ' · נענתה (אפשר לשנות)'}
        </div>
        <ExercisePrompt ex={item.ex} />
        {note && <Feedback verdict={note} />}
        <AnswerInput
          ex={item.ex}
          input={item.input}
          setInput={(input) => update(cur, { input, verdict: null })}
          onSubmit={submit}
          locked={false}
        />
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={() => { setCur(nextUnanswered(cur)); setNote(null); }}>
            דלגי
          </button>
          <button className="btn" disabled={answered === 0} onClick={() => {
            if (answered < items.length && !confirm(`ענית על ${answered} מתוך ${items.length} שאלות. לסיים בכל זאת? שאלות שלא נענו ייחשבו כטעות.`)) return;
            finish();
          }}>
            סיום הבוחן
          </button>
        </div>
      </div>
    </div>
  );
}
