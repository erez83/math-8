import { AVAILABLE_UNITS, UNITS } from '../content/units';
import { computeStreak } from '../lib/db';
import { subtopicMastery, tierOf, unitMastery } from '../lib/mastery';
import { achievements, lastWeek, weeklyImprovements } from '../lib/progress';
import { go } from '../lib/router';
import { useData } from '../lib/store';

/** Donut showing a 0–100 value. */
function Ring({ value, size = 104 }: { value: number; size?: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${value}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)">
        {value}%
      </text>
    </svg>
  );
}

function WeekChart() {
  const data = useData();
  const days = lastWeek(data.attempts);
  const max = Math.max(5, ...days.map((d) => d.total));
  const total = days.reduce((s, d) => s + d.total, 0);
  const right = days.reduce((s, d) => s + d.correct, 0);
  return (
    <div className="card">
      <h2>השבוע שלך</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        {total === 0 ? 'עוד לא תרגלת השבוע.' : `${total} תרגילים השבוע, ${Math.round((100 * right) / total)}% נכונים.`}
      </p>
      <div className="week">
        {days.map((d) => (
          <div className="week-col" key={d.key} title={`${d.correct} נכונים מתוך ${d.total}`}>
            <div className="week-num">{d.total || ''}</div>
            <div className="week-bar" style={{ height: `${(100 * d.total) / max}%` }}>
              <div className="week-right" style={{ height: d.total ? `${(100 * d.correct) / d.total}%` : 0 }} />
            </div>
            <div className="week-label">{d.label}</div>
          </div>
        ))}
      </div>
      <div className="legend small muted" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8 }}>
        <span>
          <span className="dot" style={{ background: 'var(--ok)' }} />
          נכונים
        </span>
        <span>
          <span className="dot" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }} />
          לא נכונים
        </span>
      </div>
    </div>
  );
}

export function Abilities() {
  const data = useData();
  const allSubIds = AVAILABLE_UNITS.flatMap((u) => u.content!.subtopics.map((s) => s.id));
  const overall = allSubIds.length ? Math.round(allSubIds.reduce((s, id) => s + subtopicMastery(data.bySubtopic.get(id) ?? []), 0) / allSubIds.length) : 0;
  const total = data.attempts.length;
  const correct = data.attempts.filter((a) => a.correct).length;
  const streak = computeStreak(data.practiceDays);

  const subs = AVAILABLE_UNITS.flatMap((u) =>
    u.content!.subtopics.map((s) => ({ unit: u, s, m: subtopicMastery(data.bySubtopic.get(s.id) ?? []), n: data.bySubtopic.get(s.id)?.length ?? 0 })),
  );
  const strong = subs.filter((x) => x.m >= 70).sort((a, b) => b.m - a.m).slice(0, 4);
  const toStrengthen = subs.filter((x) => x.n > 0 && x.m < 70).sort((a, b) => a.m - b.m).slice(0, 4);
  const improved = weeklyImprovements(UNITS, data.bySubtopic);
  const badges = achievements(UNITS, data.attempts, data.bySubtopic, data.quizzes, data.practiceDays);
  const recentQuizzes = [...data.quizzes].sort((a, b) => b.ts - a.ts).slice(0, 5);

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')}>→ בית</button>
        <h1>היכולות שלי</h1>
      </div>

      <div className="card overall">
        <Ring value={overall} />
        <div className="overall-stats">
          <div>
            <strong>{tierOf(overall).name}</strong>
            <div className="muted small">שליטה כללית בנושאים שנלמדו</div>
          </div>
          <div className="mini-stats">
            <span>
              <b>{total}</b> תרגילים
            </span>
            <span>
              <b>{total ? Math.round((100 * correct) / total) : 0}%</b> הצלחה
            </span>
            <span>
              <b>{streak}</b> ימים ברצף
            </span>
          </div>
        </div>
      </div>

      {improved.length > 0 && (
        <div className="card improved">
          <h2>📈 השתפרת השבוע</h2>
          {improved.map((x) => (
            <div key={x.id} className="small" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <span>{x.title}</span>
              <span style={{ color: 'var(--ok)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                מ-{x.before}% ל-{x.after}%
              </span>
            </div>
          ))}
        </div>
      )}

      <WeekChart />

      {(strong.length > 0 || toStrengthen.length > 0) && (
        <div className="two-col">
          {strong.length > 0 && (
            <div className="card">
              <h3>💪 את שולטת ב…</h3>
              <ul className="tip-list small">
                {strong.map((x) => (
                  <li key={x.s.id}>{x.s.title}</li>
                ))}
              </ul>
            </div>
          )}
          {toStrengthen.length > 0 && (
            <div className="card">
              <h3>🎯 כדאי לחזק</h3>
              <div className="list">
                {toStrengthen.map((x) => (
                  <button key={x.s.id} className="link-row small" onClick={() => go(`/practice/${x.unit.id}/${x.s.id}`)}>
                    <span>{x.s.title}</span>
                    <span className="link">תרגלי ←</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="section-title">מפת היכולות</div>
      <div className="list">
        {UNITS.map((u) => {
          if (!u.content) {
            return (
              <div className="row disabled" key={u.id}>
                <span className="num">{u.number}</span>
                <span className="body">
                  <span className="title">{u.title}</span>
                  <span className="tag soon">בקרוב</span>
                </span>
              </div>
            );
          }
          const um = unitMastery(u.content.subtopics.map((s) => s.id), data.bySubtopic);
          const ut = tierOf(um);
          return (
            <div className="card" key={u.id} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="num-badge">{u.number}</span>
                <h3 style={{ flex: 1, margin: 0 }}>{u.title}</h3>
                <span className={`tier ${ut.key}`}>
                  {ut.name} · {um}%
                </span>
              </div>
              <div className="sub-map">
                {u.content.subtopics.map((s) => {
                  const atts = data.bySubtopic.get(s.id) ?? [];
                  const mm = subtopicMastery(atts);
                  const t = tierOf(mm);
                  return (
                    <button key={s.id} className="sub-row" onClick={() => go(`/practice/${u.id}/${s.id}`)}>
                      <span className="sub-title">{s.title}</span>
                      <span className={`sub-bar ${t.key}`}>
                        <span style={{ width: `${Math.max(mm, atts.length ? 4 : 0)}%` }} />
                      </span>
                      <span className="sub-pct">{atts.length ? `${mm}%` : '—'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title">הישגים</div>
      <div className="badges">
        {badges.map((b) => (
          <div key={b.id} className={`badge ${b.earned ? 'on' : ''}`}>
            <div className="badge-icon">{b.icon}</div>
            <div className="badge-title">{b.title}</div>
            <div className="muted small">{b.detail}</div>
          </div>
        ))}
      </div>

      {recentQuizzes.length > 0 && (
        <>
          <div className="section-title">בחנים אחרונים</div>
          <div className="card">
            {recentQuizzes.map((q) => {
              const unit = UNITS.find((u) => u.id === q.unitIds[0]);
              return (
                <div key={q.id} className="small" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>
                    {q.unitIds.length > 1 ? `מבחן מעורב (${q.unitIds.length} נושאים)` : unit?.title}
                    <span className="muted"> · {new Date(q.ts).toLocaleDateString('he-IL')}</span>
                  </span>
                  <strong className="math">
                    {q.score}/{q.total}
                  </strong>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="muted small" style={{ textAlign: 'center' }}>
        הדרגות: מתחילה (0–39%) · בדרך (40–69%) · שולטת (70–89%) · מומחית (90%+). השליטה מחושבת מ-10 התרגילים האחרונים בכל נושא, לפי רמת הקושי ומספר הרמזים.
      </p>
    </div>
  );
}
