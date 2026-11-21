import { useState } from 'react';
import { AVAILABLE_UNITS, getUnit } from '../content/units';
import { unitMastery } from '../lib/mastery';
import { go } from '../lib/router';
import { useData } from '../lib/store';

const COUNTS = [10, 15, 20];

/** Choose units and length for a mixed exam ("מבחן לפני מבחן"). No timer. */
export function ExamSetup() {
  const data = useData();
  const started = AVAILABLE_UNITS.filter((u) => u.content!.subtopics.some((s) => data.bySubtopic.get(s.id)?.length));
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(started.length >= 2 ? started.map((u) => u.id) : []));
  const [count, setCount] = useState(10);
  const toggle = (id: string) =>
    setChosen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const all = chosen.size === AVAILABLE_UNITS.length;
  const exams = [...data.quizzes].filter((q) => q.unitIds.length > 1).sort((a, b) => b.ts - a.ts).slice(0, 5);
  const ordered = AVAILABLE_UNITS.filter((u) => chosen.has(u.id)).map((u) => u.id);

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')}>→ בית</button>
        <h1>מבחן לפני מבחן</h1>
      </div>
      <p className="muted small" style={{ margin: '-4px 4px 12px' }}>
        מבחן שמערבב נושאים, כמו מבחן בכיתה. בלי טיימר: אפשר לדלג ולחזור. בסוף מקבלים ציון, פירוט לפי נושא ופתרון לכל שאלה.
      </p>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h2 style={{ flex: 1, margin: 0 }}>על מה המבחן?</h2>
          <button className="icon-btn small" onClick={() => setChosen(new Set(all ? [] : AVAILABLE_UNITS.map((u) => u.id)))}>
            {all ? 'ניקוי' : 'בחירת הכול'}
          </button>
        </div>
        <div className="checks">
          {AVAILABLE_UNITS.map((u) => {
            const mm = unitMastery(u.content!.subtopics.map((s) => s.id), data.bySubtopic);
            return (
              <label key={u.id} className={`check ${chosen.has(u.id) ? 'on' : ''}`}>
                <input type="checkbox" checked={chosen.has(u.id)} onChange={() => toggle(u.id)} />
                <span className="check-box">{chosen.has(u.id) ? '✓' : ''}</span>
                <span style={{ flex: 1 }}>
                  {u.number}. {u.title}
                </span>
                <span className="muted small">{mm}%</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2>כמה שאלות?</h2>
        <div className="seg">
          {COUNTS.map((c) => (
            <button key={c} className={count === c ? 'on' : ''} onClick={() => setCount(c)}>
              {c} שאלות
            </button>
          ))}
        </div>
      </div>

      <button className="btn block" disabled={chosen.size === 0} onClick={() => go(`/exam/${ordered.join(',')}/${count}`)}>
        {chosen.size === 0 ? 'בחרי לפחות נושא אחד' : `להתחיל מבחן (${chosen.size} נושאים, ${count} שאלות)`}
      </button>

      {exams.length > 0 && (
        <>
          <div className="section-title">מבחנים קודמים</div>
          <div className="card">
            {exams.map((q) => (
              <div key={q.id} className="small" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span>
                  {q.unitIds.length === AVAILABLE_UNITS.length ? 'כל הנושאים' : q.unitIds.map((id) => getUnit(id)?.title).join(', ')}
                  <span className="muted"> · {new Date(q.ts).toLocaleDateString('he-IL')}</span>
                </span>
                <strong className="math">
                  {q.score}/{q.total}
                </strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
