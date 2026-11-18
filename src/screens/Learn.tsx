import { useEffect, useState } from 'react';
import { getUnit } from '../content/units';
import { back, go } from '../lib/router';
import { useData } from '../lib/store';
import { MathText } from '../components/MathText';
import { InteractiveVisual } from '../components/Visuals';

export function Learn({ unitId, subtopicId }: { unitId: string; subtopicId: string }) {
  const unit = getUnit(unitId);
  const sub = unit?.content?.subtopics.find((s) => s.id === subtopicId);
  const data = useData();
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    if (sub) data.markSeen(sub.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtopicId]);

  if (!unit || !sub) return <p>הנושא לא נמצא.</p>;
  const ex = sub.explanations[variant];

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => back(`/unit/${unitId}`)}>→ חזרה</button>
        <h1>{sub.title}</h1>
      </div>

      {sub.explanations.length > 1 && (
        <div className="seg" style={{ marginBottom: 12 }} role="tablist" aria-label="דרכי הסבר">
          {sub.explanations.map((e, i) => (
            <button key={i} className={i === variant ? 'on' : ''} onClick={() => setVariant(i)}>
              {e.label}
            </button>
          ))}
        </div>
      )}

      <div className="card explain">
        <h2>{ex.title}</h2>
        {ex.paragraphs.map((p, i) => (
          <p key={i}>
            <MathText text={p} />
          </p>
        ))}
        {ex.example && (
          <div className="example">
            <strong>
              דוגמה: <MathText text={ex.example.question} />
            </strong>
            <ol>
              {ex.example.steps.map((s, i) => (
                <li key={i}>
                  <MathText text={s} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {ex.interactive && <InteractiveVisual kind={ex.interactive} />}

      <div className="btn-row">
        {sub.explanations.length > 1 && (
          <button className="btn secondary" onClick={() => setVariant((variant + 1) % sub.explanations.length)}>
            תסביר לי אחרת
          </button>
        )}
        <button className="btn" onClick={() => go(`/practice/${unitId}/${sub.id}`)}>
          לתרגול ←
        </button>
      </div>
    </div>
  );
}
