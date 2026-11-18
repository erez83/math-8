import type { Subtopic, Unit } from './types';
import { ratioUnit } from './units/ratio';
import { ratioEquivUnit } from './units/ratioEquiv';
import { ratioDivideUnit } from './units/ratioDivide';

/**
 * All 13 units in the book's order. Unit and subtopic IDs are permanent:
 * progress is stored by them, so they must never be renamed or reused.
 * A unit without `content` shows as "coming soon".
 */
export const UNITS: Unit[] = [
  { id: 'function', number: 1, title: 'פונקציה', bookRef: "חלק א', הפונקציה הקווית" },
  { id: 'ratio', number: 2, title: 'יחס', bookRef: "חלק א', יחס", addedIn: '0.1.0', content: ratioUnit },
  { id: 'ratio-equiv', number: 3, title: 'יחסים שווים: צמצום והרחבה', bookRef: "חלק א', יחס", addedIn: '0.1.0', content: ratioEquivUnit },
  { id: 'ratio-divide', number: 4, title: 'חלוקה ביחס', bookRef: "חלק א', חלוקה ביחס", addedIn: '0.1.0', content: ratioDivideUnit },
  { id: 'proportion', number: 5, title: 'פרופורציה', bookRef: "חלק א' + חלק ב', יחס ישר" },
  { id: 'scale', number: 6, title: 'קנה מידה', bookRef: "חלק א', קנה מידה" },
  { id: 'equations', number: 7, title: 'משוואות בנעלם אחד', bookRef: "חלק א', משוואות" },
  { id: 'percent', number: 8, title: 'אחוזים', bookRef: "חלק א', אחוזים" },
  { id: 'estimation', number: 9, title: 'אומדן', bookRef: "חלק א', אחוזים: אומדנים" },
  { id: 'statistics', number: 10, title: 'סטטיסטיקה', bookRef: "חלק ב', סטטיסטיקה" },
  { id: 'pythagoras', number: 11, title: 'משפט פיתגורס', bookRef: "חלק ב', משפט פיתגורס" },
  { id: 'area', number: 12, title: 'שטחים', bookRef: 'חזרה' },
  { id: 'volume', number: 13, title: 'נפחים', bookRef: "חלק ב', פיתגורס במרחב והגליל" },
];

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function findSubtopic(id: string): { unit: Unit; subtopic: Subtopic } | undefined {
  for (const unit of UNITS) {
    const subtopic = unit.content?.subtopics.find((s) => s.id === id);
    if (subtopic) return { unit, subtopic };
  }
  return undefined;
}

export const AVAILABLE_UNITS = UNITS.filter((u) => u.content);
