import { useEffect, useState } from 'react';
import type { Exercise } from '../content/types';
import { findSubtopic } from '../content/units';
import { addAttempt, dayKey } from '../lib/db';
import { pickReview, reviewLevel, type ReviewPick } from '../lib/exam';
import { subtopicMastery } from '../lib/mastery';
import { makeRng, randomSeed } from '../lib/random';
import { back, go } from '../lib/router';
import { useData } from '../lib/store';
import { setBusy } from '../lib/update';
import type { Verdict } from '../lib/answer';
import { MathText } from '../components/MathText';
import { AnswerInput, emptyInput, evaluate, ExercisePrompt, Feedback, Solution, type InputState } from '../components/ExerciseParts';

const COUNT = 8;
const HINT_TITLES = ['מה שואלים?', 'איך חושבים?', 'הצעד הראשון'];
const HINT_ICONS = ['🔍', '💡', '👣'];
const REASON: Record<ReviewPick['reason'], string> = { weak: 'לחיזוק', stale: 'חזרה', new: 'נושא חדש' };

interface Done {
  pick: ReviewPick;
  correct: boolean;
}

/**
 * Daily review: 8 exercises chosen for her. Weak topics, topics not practiced
 * for a while, and one new topic. Hints work as in practice.
 */
export function Review() {
  const data = useData();
  const [queue] = useState<ReviewPick[]>(() => pickReview(data.bySubtopic, COUNT, makeRng(randomSeed())));
  const [before] = useState(() => new Map(queue.map((p) => [p.subtopicId, subtopicMastery(data.bySubtopic.get(p.subtopicId) ?? [])])));
  const [i, setI] = useState(0);
  const [ex, setEx] = useState<Exercise | null>(null);
  const [input, setInput] = useState<InputState>(emptyInput);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [recorded, setRecorded] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<Done[]>([]);

  useEffect(() => {
    setBusy(i < queue.length);
    return () => setBusy(false);
  }, [i, queue.length]);

  useEffect(() => {
    const p = queue[i];
    if (!p) return;
    const found = findSubtopic(p.subtopicId);
    if (!found) return;
    setEx(found.subtopic.generate(reviewLevel(data.bySubtopic, p.subtopicId), makeRng(randomSeed())));
    setInput(emptyInput);
    setVerdict(null);
    setHints(0);
    setShowSolution(false);
    setRecorded(null);
    setFinished(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (queue.length === 0) return <p>אין עדיין נושאים לחזרה.</p>;

  const pick = queue[i];

  const record = async (correct: boolean) => {
    if (recorded !== null || !ex) return;
    setRecorded(correct);
    setResults((r) => [...r, { pick, correct }]);
    await addAttempt({ unitId: pick.unitId, subtopicId: pick.subtopicId, level: ex.level, correct, hintsUsed: hints, source: 'practice', ts: Date.now() });
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

  const next = async () => {
    if (i + 1 >= queue.length) {
      await data.setReviewDone(dayKey(Date.now()));
      await data.refresh();
      window.scrollTo(0, 0);
    }
    setI(i + 1);
  };

  // ---------- summary ----------
  if (i >= queue.length) {
    const right = results.filter((r) => r.correct).length;
    const uniq = [...new Map(queue.map((p) => [p.subtopicId, p])).values()];
    return (
      <div>
        <div className="topbar">
          <button className="icon-btn" onClick={() => go('/')}>→ בית</button>
          <h1>החזרה היומית הושלמה</h1>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem' }}>{right >= queue.length - 1 ? '🌟' : right >= queue.length / 2 ? '💪' : '🌱'}</div>
          <div className="score-big">
            {right}/{queue.length}
          </div>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            {right >= queue.length - 1 ? 'מעולה! הנושאים האלה יושבים טוב.' : right >= queue.length / 2 ? 'עבודה טובה. כל חזרה מחזקת.' : 'אלה בדיוק הנושאים שכדאי לחזק. מחר נחזור עליהם שוב.'}
          </p>
        </div>
        <div className="card">
          <h2>מה תרגלנו היום</h2>
          {uniq.map((p) => {
            const now = subtopicMastery(data.bySubtopic.get(p.subtopicId) ?? []);
            const was = before.get(p.subtopicId) ?? 0;
            const rs = results.filter((r) => r.pick.subtopicId === p.subtopicId);
            return (
              <div key={p.subtopicId} className="small" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1 }}>
                  {rs.map((r) => (r.correct ? '✓' : '✗')).join(' ')} {findSubtopic(p.subtopicId)?.subtopic.title}
                </span>
                <span style={{ whiteSpace: 'nowrap', color: now > was ? 'var(--ok)' : 'var(--text-2)', fontWeight: 600 }}>
                  {now > was ? `מ-${was}% ל-${now}%` : `${now}%`}
                </span>
              </div>
            );
          })}
        </div>
        <div className="btn-row">
          <button className="btn secondary" onClick={() => go('/abilities')}>
            היכולות שלי
          </button>
          <button className="btn" onClick={() => go('/')}>
            סיום
          </button>
        </div>
      </div>
    );
  }

  const sub = findSubtopic(pick.subtopicId);

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back('/')}>→ יציאה</button>
        <h1>חזרה יומית</h1>
        <span className="session">
          {i + 1}/{queue.length}
        </span>
      </div>
      <div className="progress" style={{ marginBottom: 12 }}>
        <div style={{ width: `${(100 * i) / queue.length}%` }} />
      </div>

      {ex && sub && (
        <div className="card" key={i}>
          <div className="muted small" style={{ marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`review-tag ${pick.reason}`}>{REASON[pick.reason]}</span>
            {sub.subtopic.title} · {sub.unit.title}
          </div>
          <ExercisePrompt ex={ex} />

          {Array.from({ length: hints }, (_, h) => (
            <div className="hint" key={h}>
              <div className="hint-title">
                {HINT_ICONS[h]} {HINT_TITLES[h]}
              </div>
              <MathText text={ex.hints[h]} />
            </div>
          ))}

          {verdict && <Feedback verdict={verdict} seed={i} />}
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
              <button
                className="btn ghost"
                onClick={() => {
                  record(false);
                  setShowSolution(true);
                  setFinished(true);
                }}
              >
                הראי פתרון
              </button>
            )}
            {finished && !showSolution && verdict?.status !== 'correct' && (
              <button className="btn ghost" onClick={() => setShowSolution(true)}>
                הראי פתרון
              </button>
            )}
            {finished && (
              <button className="btn" onClick={next}>
                {i + 1 >= queue.length ? 'לסיכום ←' : 'הבא ←'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
