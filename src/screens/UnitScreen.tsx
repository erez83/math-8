import { useEffect } from 'react';
import { getUnit } from '../content/units';
import { compareVersions } from '../content/whatsNew';
import { subtopicMastery, tierOf, unitMastery } from '../lib/mastery';
import { go } from '../lib/router';
import { useData } from '../lib/store';
import { MathText } from '../components/MathText';

export function UnitScreen({ unitId }: { unitId: string }) {
  const unit = getUnit(unitId);
  const data = useData();

  useEffect(() => {
    if (unit) data.markSeen(unit.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  if (!unit?.content) return <p>היחידה לא נמצאה.</p>;
  const c = unit.content;
  const mastery = unitMastery(c.subtopics.map((s) => s.id), data.bySubtopic);
  const quizzes = data.quizzes.filter((q) => q.unitIds.includes(unit.id));
  const best = quizzes.reduce((b, q) => Math.max(b, q.score), -1);

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')}>→ בית</button>
        <h1>
          {unit.number}. {unit.title}
        </h1>
      </div>
      <p className="muted small" style={{ margin: '-4px 4px 12px' }}>
        בספר: {unit.bookRef} · שליטה ביחידה: {mastery}%
      </p>

      <div className="card hook">
        <h2>{c.hook.title}</h2>
        <p>
          <MathText text={c.hook.text} />
        </p>
      </div>

      <div className="section-title">נושאים</div>
      <div className="list">
        {c.subtopics.map((s) => {
          const atts = data.bySubtopic.get(s.id) ?? [];
          const mm = subtopicMastery(atts);
          const tier = tierOf(mm);
          const isNew = compareVersions(s.addedIn, data.installedVersion) > 0 && !data.seenItems.includes(s.id);
          return (
            <div className="card" key={s.id} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ flex: 1, margin: 0 }}>
                  {s.title}
                  {isNew && <span className="tag new">חדש</span>}
                </h3>
                <span className={`tier ${tier.key}`}>{tier.name}</span>
              </div>
              <div className="progress">
                <div style={{ width: `${mm}%` }} />
              </div>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <button className="btn secondary" onClick={() => go(`/learn/${unit.id}/${s.id}`)}>
                  הסבר
                </button>
                <button className="btn" onClick={() => go(`/practice/${unit.id}/${s.id}`)}>
                  תרגול
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn secondary" onClick={() => go(`/practice/${unit.id}/all`)}>
          תרגול מעורב
        </button>
        <button className="btn" onClick={() => go(`/quiz/${unit.id}`)}>
          בוחן יחידה
        </button>
      </div>
      {best >= 0 && (
        <p className="muted small" style={{ textAlign: 'center' }}>
          הציון הגבוה שלך בבוחן: {best}/10
        </p>
      )}

      <div className="section-title">טריקים לזכור</div>
      <div className="card">
        <ul className="tip-list">
          {c.tricks.map((t, i) => (
            <li key={i}>
              <MathText text={t} />
            </li>
          ))}
        </ul>
      </div>

      <div className="section-title">טעויות נפוצות</div>
      {c.commonMistakes.map((mk, i) => (
        <div className="card" key={i}>
          <h3>⚠︎ {mk.title}</h3>
          <p className="small" style={{ margin: 0 }}>
            <MathText text={mk.text} />
          </p>
        </div>
      ))}
    </div>
  );
}
