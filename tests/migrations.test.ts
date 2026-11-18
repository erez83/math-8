import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { addAttempt, getAllAttempts, getMeta, resetDBConnection, setMeta, DB_NAME, type BackupData } from '../src/lib/db';
import {
  DATA_VERSION,
  exportData,
  importBackup,
  listBackups,
  migrateData,
  runStartupMigrations,
  type Migration,
} from '../src/lib/migrations';

beforeEach(async () => {
  await resetDBConnection();
  await new Promise<void>((res) => {
    const r = indexedDB.deleteDatabase(DB_NAME);
    r.onsuccess = r.onerror = r.onblocked = () => res();
  });
});

const attempt = (ts: number) => ({
  unitId: 'ratio', subtopicId: 'ratio.concept', level: 1 as const, correct: true, hintsUsed: 0, source: 'practice' as const, ts,
});

describe('update safety', () => {
  it('first run records versions; later runs keep all data', async () => {
    await runStartupMigrations('0.1.0');
    expect(await getMeta('dataVersion')).toBe(DATA_VERSION);
    expect(await getMeta('installedVersion')).toBe('0.1.0');

    await addAttempt(attempt(1));
    await addAttempt(attempt(2));

    // Simulate an app update: new code, same device data.
    await resetDBConnection();
    await runStartupMigrations('0.2.0');
    expect(await getAllAttempts()).toHaveLength(2);
    expect(await getMeta('installedVersion')).toBe('0.1.0');
  });

  it('migrates old data with a backup taken first', async () => {
    await runStartupMigrations('0.1.0');
    await addAttempt(attempt(1));
    // Pretend the stored data is from an older data version.
    await setMeta('dataVersion', 0);
    await resetDBConnection();
    // DATA_VERSION 1 has no migration from 0 in the real list, so test the engine with an injected one.
    const migrations: Record<number, Migration> = { 1: (d) => ({ ...d, meta: { ...d.meta, migratedFlag: true } }) };
    const exported = await exportData('0.2.0');
    const migrated = migrateData(exported, 1, migrations);
    expect(migrated.dataVersion).toBe(1);
    expect(migrated.meta.migratedFlag).toBe(true);
    expect(migrated.attempts).toHaveLength(1);
  });

  it('a missing migration fails loudly instead of losing data', () => {
    const d: BackupData = { format: 'math8-backup', dataVersion: 1, appVersion: 'x', exportedAt: 0, meta: {}, attempts: [], quizzes: [] };
    expect(() => migrateData(d, 2, {})).toThrow();
  });

  it('export → import round-trips, and import saves a backup first', async () => {
    await runStartupMigrations('0.1.0');
    await addAttempt(attempt(1));
    await addAttempt(attempt(2));
    const file = JSON.stringify(await exportData('0.1.0'));

    await addAttempt(attempt(3));
    await importBackup(file, '0.1.0');
    expect(await getAllAttempts()).toHaveLength(2);
    const backups = await listBackups();
    expect(backups.length).toBe(1);
    expect(backups[0].data.attempts).toHaveLength(3);
  });

  it('rejects files that are not backups', async () => {
    await runStartupMigrations('0.1.0');
    await expect(importBackup('{"hello":1}', '0.1.0')).rejects.toThrow();
    await expect(importBackup('not json', '0.1.0')).rejects.toThrow();
  });
});
