import { useEffect, useMemo, useState } from 'react';
import type { Exercise } from '../content/types';
import { getUnit } from '../content/units';
import { addAttempt, addQuiz } from '../lib/db';
import { buildExam, unitOf } from '../lib/exam';
import { makeRng, randomSeed } from '../lib/random';
import { back, go } from '../lib/router';
import { useData } from '../lib/store';
import { setBusy } from '../lib/update';
import { formatAnswer, type Verdict } from '../lib/answer';
import { MathText } from '../components/MathText';
import { AnswerInput, emptyInput, evaluate, ExercisePrompt, Feedback, Solution, type InputState } from '../components/ExerciseParts';

interface Item {
  ex: Exercise;
  input: InputState;
  verdict: Verdict | null; // final verdict once answered
  almostShown: boolean;
}

function build(unitIds: string[], count: number): Item[] {
  return buildExam(unitIds, count, makeRng(randomSeed())).map((ex) => ({ ex, input: emptyInput, verdict: null, almostShown: false }));
}

/** A unit quiz (one unit, 10 questions) or a mixed exam (several units). No timer. */
export function Quiz({ unitIds, count = 10 }: { unitIds: string[]; count?: number }) {
  const data = useData();
  const isUnitQuiz = unitIds.length === 1;
  const unit = isUnitQuiz ? getUnit(unitIds[0]) : undefined;
  const title = isUnitQuiz ? `בוחן: ${unit?.title ?? ''}` : 'מבחן מעורב';
  const exitTo = isUnitQuiz ? `/unit/${unitIds[0]}` : '/exam';
  const [items, setItems] = useState<Item[]>(() => build(unitIds, count));
  const [cur, setCur] = useState(0);
  const [note, setNote] = useState<Verdict | null>(null);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    setBusy(!done);
    return () => setBusy(false);
  }, [done]);

  const byUnit = useMemo(() => {
    const m = new Map<string, { right: number; total: number }>();
    for (const it of items) {
      const u = unitOf(it.ex.subtopicId);
      const s = m.get(u) ?? { right: 0, total: 0 };
      s.total++;
      if (it.verdict?.status === 'correct') s.right++;
      m.set(u, s);
    }
    return m;
  }, [items]);

  if (items.length === 0) return <p>לא נבחרו יחידות.</p>;

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
      await addAttempt({ unitId: unitOf(it.ex.subtopicId), subtopicId: it.ex.subtopicId, level: it.ex.level, correct: it.verdict?.status === 'correct', hintsUsed: 0, source: 'quiz', ts });
    }
    await addQuiz({ unitIds, score, total: final.length, ts });
    await data.refresh();
    setDone(true);
    window.scrollTo(0, 0);
  };

  if (done) {
    const score = items.filter((it) => it.verdict?.status === 'correct').length;
    const pct = score / items.length;
    return (
      <div>
        <div className="topbar">
          <button className="icon-btn" onClick={() => go(exitTo)}>→ {isUnitQuiz ? 'ליחידה' : 'למבחנים'}</button>
          <h1>תוצאות {isUnitQuiz ? 'הבוחן' : 'המבחן'}</h1>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="score-big">
            {score}/{items.length}
          </div>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            {pct === 1 ? 'מושלם. מרשים!' : pct >= 0.8 ? 'תוצאה מצוינת.' : pct >= 0.6 ? 'יפה. כדאי לעבור על הטעויות למטה.' : 'שווה לחזור על ההסברים ולתרגל עוד קצת. את בדרך.'}
          </p>
        </div>

        {!isUnitQuiz && (
          <div className="card">
            <h2>לפי נושא</h2>
            {[...byUnit.entries()].map(([u, s]) => (
              <button key={u} className="sub-row" style={{ width: '100%' }} onClick={() => go(`/practice/${u}/all`)}>
                <span className="sub-title">{getUnit(u)?.title}</span>
                <span className={`sub-bar ${s.right === s.total ? 'good' : s.right / s.total >= 0.5 ? 'way' : 'start'}`}>
                  <span style={{ width: `${Math.max(4, (100 * s.right) / s.total)}%` }} />
                </span>
                <span className="sub-pct">
                  {s.right}/{s.total}
                </span>
              </button>
            ))}
            <p className="muted small" style={{ marginBottom: 0 }}>
              לחיצה על נושא פותחת תרגול בו.
            </p>
          </div>
        )}

        <div className="section-title">מעבר על השאלות</div>
        <div className="list">
          {items.map((it, i) => {
            const ok = it.verdict?.status === 'correct';
            return (
              <div className="card" key={i} style={{ marginBottom: 0 }}>
                <div className="muted small">
                  שאלה {i + 1} · {getUnit(unitOf(it.ex.subtopicId))?.title} · {ok ? '✓ נכון' : '✗ לא נכון'}
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
          <button className="btn secondary" onClick={() => go(isUnitQuiz ? `/practice/${unitIds[0]}/all` : '/review')}>
            {isUnitQuiz ? 'לתרגול' : 'לחזרה יומית'}
          </button>
          <button
            className="btn"
            onClick={() => {
              setItems(build(unitIds, count));
              setCur(0);
              setDone(false);
              setOpen(null);
            }}
          >
            {isUnitQuiz ? 'בוחן חדש' : 'מבחן חדש'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back(exitTo)}>→ יציאה</button>
        <h1>{title}</h1>
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
          {!isUnitQuiz && ` · ${getUnit(unitOf(item.ex.subtopicId))?.title}`}
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
            סיום {isUnitQuiz ? 'הבוחן' : 'המבחן'}
          </button>
        </div>
      </div>
    </div>
  );
}
