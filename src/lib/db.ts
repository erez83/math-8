/**
 * Personal data storage (IndexedDB). This lives apart from the app code,
 * so updating the app never touches it.
 *
 * Rules that keep updates safe (SPEC section 9):
 *  1. Stores and indexes are only ever ADDED, never deleted or renamed.
 *  2. Records reference content by stable IDs (e.g. "ratio.simplify") that never change.
 *  3. Changes to the shape of the data go through migrations.ts, which saves a backup first.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface Attempt {
  id?: number;
  unitId: string;
  subtopicId: string;
  level: 1 | 2 | 3;
  correct: boolean;
  hintsUsed: number;
  /** 'practice' or 'quiz' */
  source: 'practice' | 'quiz';
  ts: number;
}

export interface QuizResult {
  id?: number;
  unitIds: string[];
  score: number;
  total: number;
  ts: number;
}

export interface BackupRecord {
  id?: number;
  ts: number;
  reason: string;
  appVersion: string;
  data: BackupData;
}

/** Everything personal, in one portable object (also the export file format). */
export interface BackupData {
  format: 'math8-backup';
  dataVersion: number;
  appVersion: string;
  exportedAt: number;
  meta: Record<string, unknown>;
  attempts: Attempt[];
  quizzes: QuizResult[];
}

interface MathDB extends DBSchema {
  meta: { key: string; value: unknown };
  attempts: { key: number; value: Attempt; indexes: { bySubtopic: string } };
  quizzes: { key: number; value: QuizResult };
  backups: { key: number; value: BackupRecord };
}

export const DB_NAME = 'math8';
/** IndexedDB structure version. Bump only to ADD stores/indexes. */
const DB_STRUCTURE_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MathDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MathDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MathDB>(DB_NAME, DB_STRUCTURE_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('meta');
          const attempts = db.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
          attempts.createIndex('bySubtopic', 'subtopicId');
          db.createObjectStore('quizzes', { keyPath: 'id', autoIncrement: true });
          db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
        }
        // Future structure versions: add `if (oldVersion < 2) { ... }` here. Never delete stores.
      },
    });
  }
  return dbPromise;
}

/** Test helper: close and forget the cached connection (like restarting the app). */
export async function resetDBConnection() {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await (await getDB()).get('meta', key)) as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await (await getDB()).put('meta', value, key);
}

export async function addAttempt(a: Omit<Attempt, 'id'>): Promise<void> {
  const db = await getDB();
  await db.add('attempts', a as Attempt);
  // Record the practice day for the streak.
  const day = dayKey(a.ts);
  const days = ((await db.get('meta', 'practiceDays')) as string[] | undefined) ?? [];
  if (!days.includes(day)) {
    days.push(day);
    await db.put('meta', days, 'practiceDays');
  }
}

export async function getAllAttempts(): Promise<Attempt[]> {
  return (await getDB()).getAll('attempts');
}

export async function addQuiz(q: Omit<QuizResult, 'id'>): Promise<void> {
  await (await getDB()).add('quizzes', q as QuizResult);
}

export async function getAllQuizzes(): Promise<QuizResult[]> {
  return (await getDB()).getAll('quizzes');
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Consecutive practice days ending today (or yesterday, so the streak survives until tonight). */
export function computeStreak(days: string[], now = Date.now()): number {
  const set = new Set(days);
  const oneDay = 86_400_000;
  let cursor = now;
  if (!set.has(dayKey(cursor))) cursor -= oneDay;
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor -= oneDay;
  }
  return streak;
}
