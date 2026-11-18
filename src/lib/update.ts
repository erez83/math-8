/**
 * App updates. The new version downloads in the background; the app only offers
 * to switch when the student is NOT in the middle of practice or a quiz, and a
 * backup is saved right before switching.
 */
import { registerSW } from 'virtual:pwa-register';
import { saveBackup } from './migrations';

type Listener = () => void;

let needRefresh = false;
let busy = false;
let doUpdate: ((reload?: boolean) => Promise<void>) | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function initUpdates() {
  if (!('serviceWorker' in navigator)) return;
  doUpdate = registerSW({
    onNeedRefresh() {
      needRefresh = true;
      emit();
    },
    onRegisteredSW(_url, registration) {
      // Check for a new version once an hour while the app is open.
      if (registration) setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    },
  });
}

export function subscribeUpdates(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** True when an update is waiting AND it's a good moment to offer it. */
export function shouldOfferUpdate(): boolean {
  return needRefresh && !busy;
}

/** Practice and quiz screens mark themselves busy so the update offer waits. */
export function setBusy(value: boolean) {
  busy = value;
  emit();
}

export async function applyUpdate(appVersion: string) {
  await saveBackup('לפני עדכון האפליקציה', appVersion);
  await doUpdate?.(true);
}
