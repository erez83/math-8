import { AVAILABLE_UNITS, findSubtopic, UNITS } from '../content/units';
import { compareVersions } from '../content/whatsNew';
import { computeStreak, dayKey } from '../lib/db';
import { subtopicMastery, tierOf, unitMastery } from '../lib/mastery';
import { go } from '../lib/router';
import { useData } from '../lib/store';

function isIosSafariBrowser() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua);
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone || matchMedia('(display-mode: standalone)').matches;
  return ios && !standalone;
}

export function Home() {
  const data = useData();
  const streak = computeStreak(data.practiceDays);
  const today = data.attempts.filter((a) => new Date(a.ts).toDateString() === new Date().toDateString()).length;

  const isNew = (id: string, addedIn?: string) =>
    !!addedIn && compareVersions(addedIn, data.installedVersion) > 0 && !data.seenItems.includes(id);

  // Daily recommendation: weakest started subtopic, else the next one not started.
  const allSubs = AVAILABLE_UNITS.flatMap((u) => u.content!.subtopics.map((s) => ({ unit: u, s })));
  const started = allSubs.filter(({ s }) => (data.bySubtopic.get(s.id)?.length ?? 0) > 0);
  const weak = started
    .map((x) => ({ ...x, m: subtopicMastery(data.bySubtopic.get(x.s.id) ?? []) }))
    .filter((x) => x.m < 70)
    .sort((a, b) => a.m - b.m)[0];
  const fresh = allSubs.find(({ s }) => !data.bySubtopic.get(s.id)?.length);
  const rec = weak ?? fresh;
  const last = data.lastSubtopic ? findSubtopic(data.lastSubtopic) : undefined;
  const reviewDone = data.reviewDoneDay === dayKey(Date.now());
  const overall = allSubs.length
    ? Math.round(allSubs.reduce((sum, { s }) => sum + subtopicMastery(data.bySubtopic.get(s.id) ?? []), 0) / allSubs.length)
    : 0;

  return (
    <div>
      <div className="topbar">
        <h1>מתמטיקה לכיתה ח'</h1>
        <button className="icon-btn" onClick={() => go('/settings')} aria-label="הגדרות">
          ⚙︎
        </button>
      </div>

      {isIosSafariBrowser() && (
        <div className="card">
          <h3>התקנה למסך הבית</h3>
          <p className="small" style={{ margin: 0 }}>
            ב-Safari לוחצים על כפתור השיתוף (ריבוע עם חץ למעלה), ואז על <strong>"הוסף למסך הבית"</strong>. אחרי ההתקנה האפליקציה עובדת גם בלי אינטרנט, וההתקדמות נשמרת בבטחה.
          </p>
        </div>
      )}

      <div className="hero">
        <div className="stat">
          <div className="v">{streak}</div>
          <div className="l">ימים ברצף</div>
        </div>
        <div className="stat">
          <div className="v">{today}</div>
          <div className="l">תרגילים היום</div>
        </div>
      </div>

      <button className="row abilities-row" style={{ marginTop: 12 }} onClick={() => go('/abilities')}>
        <span className="num">📊</span>
        <span className="body">
          <span className="title">היכולות שלי</span>
          <div className="muted small">
            שליטה כללית {overall}% · {tierOf(overall).name}
          </div>
          <div className="progress">
            <div style={{ width: `${overall}%` }} />
          </div>
        </span>
        <span className="chev">‹</span>
      </button>

      {last && (
        <button className="row" style={{ marginTop: 12 }} onClick={() => go(`/practice/${last.unit.id}/${last.subtopic.id}`)}>
          <span className="num">▶</span>
          <span className="body">
            <span className="title">המשך מאיפה שעצרת</span>
            <div className="muted small">{last.subtopic.title}</div>
          </span>
          <span className="chev">‹</span>
        </button>
      )}

      {started.length === 0 && rec ? (
        <button className="row daily" style={{ marginTop: 8 }} onClick={() => go(`/learn/${rec.unit.id}/${rec.s.id}`)}>
          <span className="num">★</span>
          <span className="body">
            <span className="title">הצעד הראשון</span>
            <div className="muted small">
              {rec.s.title} · {rec.unit.title}
            </div>
          </span>
          <span className="chev">‹</span>
        </button>
      ) : (
        <button className={`row daily ${reviewDone ? 'done' : ''}`} style={{ marginTop: 8 }} onClick={() => go('/review')}>
          <span className="num">{reviewDone ? '✓' : '🔁'}</span>
          <span className="body">
            <span className="title">{reviewDone ? 'החזרה היומית הושלמה' : 'חזרה יומית'}</span>
            <div className="muted small">
              {reviewDone
                ? 'כל הכבוד! אפשר לעשות עוד סבב אם בא לך.'
                : `8 תרגילים שנבחרו בשבילך${weak ? `, כולל ${weak.s.title}` : ''}`}
            </div>
          </span>
          <span className="chev">‹</span>
        </button>
      )}

      <button className="row" style={{ marginTop: 8 }} onClick={() => go('/exam')}>
        <span className="num">📝</span>
        <span className="body">
          <span className="title">מבחן לפני מבחן</span>
          <div className="muted small">מבחן שמערבב נושאים, בלי טיימר</div>
        </span>
        <span className="chev">‹</span>
      </button>

      <div className="section-title">יחידות הלימוד</div>
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
          const mastery = unitMastery(u.content.subtopics.map((s) => s.id), data.bySubtopic);
          const tier = tierOf(mastery);
          return (
            <button className="row" key={u.id} onClick={() => go(`/unit/${u.id}`)}>
              <span className="num">{u.number}</span>
              <span className="body">
                <span className="title">{u.title}</span>
                {isNew(u.id, u.addedIn) && <span className="tag new">חדש</span>}
                <div className="progress">
                  <div style={{ width: `${mastery}%` }} />
                </div>
              </span>
              <span className={`tier ${tier.key}`}>{tier.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
