import { useEffect, useState, useSyncExternalStore } from 'react';
import { DataProvider, useData } from './lib/store';
import { useRoute } from './lib/router';
import { applyUpdate, shouldOfferUpdate, subscribeUpdates } from './lib/update';
import { getMeta, setMeta } from './lib/db';
import { compareVersions, WHATS_NEW, type WhatsNewEntry } from './content/whatsNew';
import { Home } from './screens/Home';
import { UnitScreen } from './screens/UnitScreen';
import { Learn } from './screens/Learn';
import { Practice } from './screens/Practice';
import { Quiz } from './screens/Quiz';
import { Settings } from './screens/Settings';
import { Abilities } from './screens/Abilities';

const VERSION = __APP_VERSION__;

function Router() {
  const [page, a, b] = useRoute();
  switch (page) {
    case 'unit':
      return <UnitScreen unitId={a} />;
    case 'learn':
      return <Learn unitId={a} subtopicId={b} />;
    case 'practice':
      return <Practice key={`${a}/${b}`} unitId={a} subtopicId={b} />;
    case 'quiz':
      return <Quiz key={a} unitId={a} />;
    case 'settings':
      return <Settings />;
    case 'abilities':
      return <Abilities />;
    default:
      return <Home />;
  }
}

function UpdateBanner() {
  const offer = useSyncExternalStore(subscribeUpdates, shouldOfferUpdate);
  const [dismissed, setDismissed] = useState(false);
  if (!offer || dismissed) return null;
  return (
    <div className="banner" role="status">
      <span className="grow">יש גרסה חדשה. לעדכן? ההתקדמות שלך נשמרת.</span>
      <button className="no" onClick={() => setDismissed(true)}>
        אחר כך
      </button>
      <button className="yes" onClick={() => applyUpdate(VERSION)}>
        עדכון
      </button>
    </div>
  );
}

/** After an update: show what was added since the last version she saw. */
function WhatsNewModal() {
  const data = useData();
  const [entries, setEntries] = useState<WhatsNewEntry[]>([]);
  useEffect(() => {
    if (!data.ready) return;
    (async () => {
      const lastSeen = await getMeta<string>('lastSeenVersion');
      if (!lastSeen) {
        // First run: nothing to announce.
        await setMeta('lastSeenVersion', VERSION);
        return;
      }
      if (compareVersions(VERSION, lastSeen) > 0) {
        setEntries(WHATS_NEW.filter((w) => compareVersions(w.version, lastSeen) > 0));
      }
    })();
  }, [data.ready]);
  if (entries.length === 0) return null;
  const close = async () => {
    await setMeta('lastSeenVersion', VERSION);
    setEntries([]);
  };
  return (
    <div className="modal-bg" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>מה חדש באפליקציה</h2>
        <p className="muted small">כל ההתקדמות שלך נשמרה.</p>
        {entries.map((w) => (
          <div key={w.version}>
            <strong>גרסה {w.version}</strong>
            <ul className="tip-list">
              {w.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
        <button className="btn block" onClick={close}>
          מעולה
        </button>
      </div>
    </div>
  );
}

function Shell() {
  const data = useData();
  if (!data.ready) return null;
  return (
    <>
      <Router />
      <UpdateBanner />
      <WhatsNewModal />
    </>
  );
}

export function App() {
  return (
    <div className="app">
      <DataProvider>
        <Shell />
      </DataProvider>
    </div>
  );
}
