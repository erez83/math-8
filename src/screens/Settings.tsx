import { useEffect, useRef, useState } from 'react';
import { WHATS_NEW } from '../content/whatsNew';
import type { BackupRecord } from '../lib/db';
import { exportData, importBackup, listBackups, replaceAllData, migrateData, saveBackup } from '../lib/migrations';
import { go } from '../lib/router';
import { useData } from '../lib/store';

const VERSION = __APP_VERSION__;

function fmtDate(ts: number) {
  return new Date(ts).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
}

async function shareOrDownload(json: string) {
  const name = `math8-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File([json], name, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'גיבוי מתמטיקה ח\'' });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Settings() {
  const data = useData();
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadBackups = () => listBackups().then(setBackups);
  useEffect(() => {
    loadBackups();
  }, []);

  const onExport = async () => {
    const backup = await exportData(VERSION);
    await shareOrDownload(JSON.stringify(backup));
  };

  const onImport = async (f: File) => {
    try {
      if (!confirm('השחזור יחליף את ההתקדמות הנוכחית בזו שבקובץ. (גיבוי של המצב הנוכחי יישמר קודם.) להמשיך?')) return;
      await importBackup(await f.text(), VERSION);
      await data.refresh();
      await loadBackups();
      setMsg('השחזור הצליח.');
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const onRestore = async (b: BackupRecord) => {
    if (!confirm(`לשחזר את הגיבוי מ-${fmtDate(b.ts)}? המצב הנוכחי יישמר כגיבוי לפני כן.`)) return;
    await saveBackup('לפני שחזור גיבוי אוטומטי', VERSION);
    await replaceAllData(migrateData(b.data));
    await data.refresh();
    await loadBackups();
    setMsg('הגיבוי שוחזר.');
  };

  return (
    <div>
      <div className="topbar">
        <button className="icon-btn" onClick={() => go('/')}>→ בית</button>
        <h1>הגדרות</h1>
      </div>

      {msg && (
        <div className="feedback almost" onClick={() => setMsg(null)}>
          {msg}
        </div>
      )}

      <div className="card">
        <h2>גודל טקסט</h2>
        <div className="seg">
          {[
            [1, 'רגיל'],
            [1.12, 'גדול'],
            [1.25, 'גדול מאוד'],
          ].map(([v, label]) => (
            <button key={label} className={data.fontScale === v ? 'on' : ''} onClick={() => data.setFontScale(v as number)}>
              {label}
            </button>
          ))}
        </div>
        <p className="muted small" style={{ marginBottom: 0 }}>
          מצב כהה ובהיר מתחלפים לפי הגדרות האייפון.
        </p>
      </div>

      <div className="card">
        <h2>גיבוי ושחזור</h2>
        <p className="small" style={{ marginTop: 0 }}>
          ההתקדמות שמורה על המכשיר, ועדכונים לא מוחקים אותה. לפני כל עדכון נשמר גם גיבוי אוטומטי. לביטחון נוסף אפשר לשמור קובץ גיבוי, למשל ב-iCloud.
        </p>
        <div className="btn-row">
          <button className="btn secondary" onClick={onExport}>
            שמירת קובץ גיבוי
          </button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>
            שחזור מקובץ
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = '';
          }}
        />
        {backups.length > 0 && (
          <>
            <h3 style={{ marginTop: 16 }}>גיבויים אוטומטיים</h3>
            <div className="list">
              {backups.map((b) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }} className="small">
                    {fmtDate(b.ts)}
                    <div className="muted small">{b.reason}</div>
                  </div>
                  <button className="btn ghost" style={{ minHeight: 36, padding: '6px 12px' }} onClick={() => onRestore(b)}>
                    שחזור
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>מה חדש</h2>
        {WHATS_NEW.map((w) => (
          <div key={w.version} style={{ marginBottom: 10 }}>
            <strong>
              גרסה {w.version} <span className="muted small">· {w.date}</span>
            </strong>
            <ul className="tip-list small">
              {w.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="muted small" style={{ textAlign: 'center' }}>
        גרסה {VERSION}
      </p>
    </div>
  );
}
