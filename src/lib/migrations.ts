/**
 * Data migrations. Each migration is a pure function from the BackupData of
 * version N-1 to version N. Because they work on the portable backup shape, the
 * same code upgrades both the live data and an old exported backup file.
 *
 * To change the data shape in a future update:
 *   1. Bump DATA_VERSION.
 *   2. Add MIGRATIONS[DATA_VERSION] = (data) => newData.
 *   3. Add a test in tests/migrations.test.ts with sample data of the old version.
 * Never remove a migration.
 */
import {
  getDB,
  type BackupData,
  type BackupRecord,
} from './db';

export const DATA_VERSION = 1;

export type Migration = (data: BackupData) => BackupData;

export const MIGRATIONS: Record<number, Migration> = {
  // 2: (data) => ({ ...data, ... }),
};

const MAX_BACKUPS = 5;

export function migrateData(
  data: BackupData,
  target = DATA_VERSION,
  migrations: Record<number, Migration> = MIGRATIONS,
): BackupData {
  if (data.dataVersion > target) {
    throw new Error('הגיבוי נוצר בגרסה חדשה יותר של האפליקציה. עדכני את האפליקציה ונסי שוב.');
  }
  let current = data;
  for (let v = data.dataVersion + 1; v <= target; v++) {
    const m = migrations[v];
    if (!m) throw new Error(`Missing migration to data version ${v}`);
    current = { ...m(current), dataVersion: v };
  }
  return current;
}

export async function exportData(appVersion: string): Promise<BackupData> {
  const db = await getDB();
  const tx = db.transaction(['meta', 'attempts', 'quizzes'], 'readonly');
  const meta: Record<string, unknown> = {};
  let cursor = await tx.objectStore('meta').openCursor();
  while (cursor) {
    meta[String(cursor.key)] = cursor.value;
    cursor = await cursor.continue();
  }
  const attempts = await tx.objectStore('attempts').getAll();
  const quizzes = await tx.objectStore('quizzes').getAll();
  await tx.done;
  return {
    format: 'math8-backup',
    dataVersion: (meta.dataVersion as number | undefined) ?? DATA_VERSION,
    appVersion,
    exportedAt: Date.now(),
    meta,
    attempts,
    quizzes,
  };
}

/** Replaces all personal data with `data` (already migrated) in one transaction. */
export async function replaceAllData(data: BackupData): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['meta', 'attempts', 'quizzes'], 'readwrite');
  await tx.objectStore('meta').clear();
  await tx.objectStore('attempts').clear();
  await tx.objectStore('quizzes').clear();
  for (const [k, v] of Object.entries(data.meta)) await tx.objectStore('meta').put(v, k);
  await tx.objectStore('meta').put(data.dataVersion, 'dataVersion');
  for (const a of data.attempts) await tx.objectStore('attempts').put(a);
  for (const q of data.quizzes) await tx.objectStore('quizzes').put(q);
  await tx.done;
}

export async function saveBackup(reason: string, appVersion: string): Promise<void> {
  const data = await exportData(appVersion);
  const db = await getDB();
  await db.add('backups', { ts: Date.now(), reason, appVersion, data } as BackupRecord);
  const keys = await db.getAllKeys('backups');
  for (const k of keys.slice(0, Math.max(0, keys.length - MAX_BACKUPS))) await db.delete('backups', k);
}

export async function listBackups(): Promise<BackupRecord[]> {
  return (await (await getDB()).getAll('backups')).reverse();
}

/**
 * Runs at every app start. Brings stored data up to DATA_VERSION,
 * saving an automatic backup before changing anything.
 */
export async function runStartupMigrations(appVersion: string): Promise<void> {
  const db = await getDB();
  const stored = (await db.get('meta', 'dataVersion')) as number | undefined;
  if (stored === undefined) {
    // First run on this device.
    await db.put('meta', DATA_VERSION, 'dataVersion');
    await db.put('meta', appVersion, 'installedVersion');
    return;
  }
  if (stored >= DATA_VERSION) return;
  await saveBackup(`לפני עדכון נתונים לגרסה ${DATA_VERSION}`, appVersion);
  const migrated = migrateData(await exportData(appVersion));
  await replaceAllData(migrated);
}

/** Validates and imports a backup file (from any older app version). */
export async function importBackup(json: string, appVersion: string): Promise<void> {
  let parsed: BackupData;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('הקובץ אינו קובץ גיבוי תקין.');
  }
  if (parsed?.format !== 'math8-backup' || !Array.isArray(parsed.attempts)) {
    throw new Error('הקובץ אינו קובץ גיבוי של האפליקציה.');
  }
  const migrated = migrateData(parsed);
  await saveBackup('לפני שחזור מקובץ', appVersion);
  await replaceAllData(migrated);
}
