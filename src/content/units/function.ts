import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, shuffle, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake, lineText, sgn, pt } from '../helpers';

const V = '0.4.0';

function nz(rng: Rng, min: number, max: number): number {
  for (;;) {
    const v = int(rng, min, max);
    if (v !== 0) return v;
  }
}

function choiceOf(rng: Rng, right: string, wrongs: string[]) {
  const options = shuffle(rng, Array.from(new Set([right, ...wrongs.filter((w) => w !== right)])));
  return { kind: 'choice' as const, options, correct: options.indexOf(right) };
}

// ---------- function.concept ----------
function concept(level: Level, rng: Rng): Exercise {
  const id = 'function.concept';
  const mm = nz(rng, -4, 5);
  const b = int(rng, -6, 8);
  if (level === 1) {
    const x = int(rng, -3, 6);
    const y = mm * x + b;
    return {
      subtopicId: id,
      level,
      prompt: `בפונקציה ${m(lineText(mm, b))}, מה ערך y כאשר ${m(`x = ${sgn(x)}`)}?`,
      answer: { kind: 'number', value: y },
      hints: [
        'פונקציה היא "מכונה": מכניסים x ומקבלים y. כאן נתון מה נכנס, ושואלים מה יוצא.',
        'מציבים את המספר במקום x בכלל של הפונקציה, ומחשבים לפי סדר פעולות: קודם כפל, אחר כך חיבור. אם x שלילי, כדאי לשים אותו בסוגריים.',
        `הציבי: ${m(`y = ${mm === 1 ? '' : mm === -1 ? '−' : sgn(mm) + ' × '}(${sgn(x)})${b === 0 ? '' : b > 0 ? ' + ' + b : ' − ' + -b}`)}`,
      ],
      solution: [`${m(`y = ${sgn(mm)} × (${sgn(x)}) ${b >= 0 ? '+' : '−'} ${Math.abs(b)}`)}`, `${m(`y = ${sgn(mm * x)} ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${sgn(y)}`)}`],
      mistakes: mistakes(isNum(y), [numMistake(mm * x, `שכחת להוסיף את ${m(sgn(b))}.`), numMistake(mm + x + b, 'חיברת את המקדם ל-x. המקדם **כופל** את x.'), numMistake(-mm * x + b, 'טעות בסימן בכפל עם מספר שלילי.')]),
    };
  }
  if (level === 2) {
    const xs = [0, 1, 2, 4];
    const ys = xs.map((x) => mm * x + b);
    return {
      subtopicId: id,
      level,
      prompt: 'הטבלה מתארת פונקציה קווית. איזה מספר חסר בטבלה?',
      answer: { kind: 'number', value: ys[3] },
      hints: [
        'בפונקציה קווית יש "חוק" קבוע שמעביר כל x ל-y. צריך לגלות את החוק מהטבלה ולהשתמש בו.',
        'בודקים בכמה y משתנה כשמגדילים את x ב-1. זה קבוע לאורך כל הטבלה. ממנו ממשיכים לעמודה החסרה, ושמים לב שבעמודה האחרונה x קפץ ב-2.',
        `כש-x עולה מ-0 ל-1, y משתנה מ-${m(sgn(ys[0]))} ל-${m(sgn(ys[1]))}. בכמה?`,
      ],
      solution: [`כל עלייה של 1 ב-x מוסיפה ${m(sgn(mm))} ל-y.`, `מ-x = 2 ל-x = 4: עוד פעמיים ${m(sgn(mm))}.`, `${m(`${sgn(ys[2])} + 2 × (${sgn(mm)}) = ${sgn(ys[3])}`)}`],
      mistakes: mistakes(isNum(ys[3]), [numMistake(ys[2] + mm, 'הוספת רק צעד אחד. שימי לב: x קפץ מ-2 ל-4, כלומר שני צעדים.')]),
      visual: { type: 'table', rows: [['x', ...xs], ['y', ys[0], ys[1], ys[2], '?']] },
    };
  }
  const x = int(rng, -4, 7);
  const y = mm * x + b;
  return {
    subtopicId: id,
    level,
    prompt: `בפונקציה ${m(lineText(mm, b))}, עבור איזה ערך של x מתקבל ${m(`y = ${sgn(y)}`)}?`,
    answer: { kind: 'number', value: x },
    hints: [
      'הפעם הכיוון הפוך: נתון מה יצא מהמכונה (y), ושואלים מה הכניסו (x).',
      'כותבים את הפונקציה עם הערך הנתון של y, ומקבלים משוואה עם x. פותרים אותה כמו כל משוואה.',
      `המשוואה: ${m(`${sgn(y)} = ${lineText(mm, b).slice(4)}`)}`,
    ],
    solution: [`${m(`${sgn(y)} = ${lineText(mm, b).slice(4)}`)}`, `${m(`${sgn(y - b)} = ${mm === 1 ? 'x' : mm === -1 ? '−x' : sgn(mm) + 'x'}`)}`, `${m(`x = ${sgn(x)}`)}`],
    mistakes: mistakes(isNum(x), [numMistake(mm * y + b, 'הצבת את y במקום x. כאן y ידוע ו-x הוא הנעלם.')]),
  };
}

// ---------- function.slope ----------
const SLOPES = [-3, -2, -1, 1, 2, 3];

function slope(level: Level, rng: Rng): Exercise {
  const id = 'function.slope';
  if (level === 1) {
    const special = pick(rng, ['y=x', 'y=-x', 'y=mx', 'full'] as const);
    const mm = special === 'y=x' ? 1 : special === 'y=-x' ? -1 : nz(rng, -6, 6);
    const b = special === 'full' ? nz(rng, -8, 8) : 0;
    const askB = special === 'full' && rng() < 0.5;
    const ans = askB ? b : mm;
    return {
      subtopicId: id,
      level,
      prompt: askB
        ? `בנקודה ${m('(0, ?)')} הישר ${m(lineText(mm, b))} חותך את ציר y. מה המספר החסר?`
        : `מה השיפוע (m) של הישר ${m(lineText(mm, b))}?`,
      answer: { kind: 'number', value: ans },
      hints: [
        askB ? 'שואלים איפה הישר חוצה את הציר האנכי (ציר y). שם x שווה 0.' : 'השיפוע אומר כמה הישר עולה (או יורד) כשזזים צעד אחד ימינה.',
        askB
          ? 'בצורה y = mx + b, המספר הבודד (b) הוא בדיוק נקודת החיתוך עם ציר y. אפשר גם להציב x = 0 ולבדוק.'
          : 'בצורה y = mx + b, השיפוע הוא המספר שכופל את x. אם כתוב רק x, המקדם הוא 1. אם כתוב −x, המקדם הוא −1.',
        askB ? `הציבי x = 0 בפונקציה. מה יוצא?` : `מה המספר שצמוד ל-x ב-${m(lineText(mm, b))}?`,
      ],
      solution: askB ? [`כאשר ${m('x = 0')}: ${m(`y = ${sgn(b)}`)}.`] : [`המקדם של x הוא ${m(sgn(mm))}, וזה השיפוע.`],
      mistakes: mistakes(isNum(ans), [askB ? numMistake(mm, 'זה השיפוע. נקודת החיתוך עם ציר y היא המספר החופשי, b.') : numMistake(b, 'זה b, נקודת החיתוך עם ציר y. השיפוע הוא המספר שכופל את x.')]),
    };
  }
  const mm = pick(rng, SLOPES);
  const x1 = int(rng, -4, 1);
  const dx = int(rng, 1, 3);
  const b = int(rng, -3, 3);
  const y1 = mm * x1 + b;
  const x2 = x1 + dx;
  const y2 = mm * x2 + b;
  if (Math.abs(y1) > 6 || Math.abs(y2) > 6) return slope(level, rng);
  const ans = mm;
  if (level === 2) {
    return {
      subtopicId: id,
      level,
      prompt: 'מה השיפוע של הישר שבגרף?',
      answer: { kind: 'number', value: ans },
      hints: [
        'שיפוע = בכמה הישר עולה או יורד על כל צעד אחד ימינה.',
        'בוחרים שתי נקודות על הישר שנמצאות בדיוק על משבצות. סופרים: כמה צעדים ימינה, וכמה למעלה או למטה. שיפוע = שינוי ב-y חלקי שינוי ב-x. אם הישר יורד, השיפוע שלילי.',
        `הנקודות המסומנות: ${m(pt(x1, y1))} ו-${m(pt(x2, y2))}. כמה צעדים ימינה, וכמה למעלה או למטה?`,
      ],
      solution: [`שינוי ב-x: ${m(dx)}. שינוי ב-y: ${m(sgn(y2 - y1))}.`, `שיפוע: ${m(`${sgn(y2 - y1)} ÷ ${dx} = ${sgn(ans)}`)}.`],
      mistakes: mistakes(isNum(ans), [numMistake(-ans, 'הסימן הפוך. ישר שעולה משמאל לימין הוא בעל שיפוע חיובי, וישר שיורד הוא בעל שיפוע שלילי.'), numMistake(dx / (y2 - y1), 'הפכת את החילוק. שיפוע = שינוי ב-y חלקי שינוי ב-x.')]),
      visual: { type: 'graph', lines: [{ m: mm, b }], points: [{ x: x1, y: y1 }, { x: x2, y: y2 }] },
    };
  }
  return {
    subtopicId: id,
    level,
    prompt: `ישר עובר בנקודות ${m(pt(x1, y1))} ו-${m(pt(x2, y2))}. מה השיפוע שלו?`,
    answer: { kind: 'number', value: ans },
    hints: [
      'אין גרף, אבל יש שתי נקודות. השיפוע הוא "קצב השינוי" ביניהן.',
      'מחשבים שני הפרשים, באותו סדר: בכמה השתנה y, ובכמה השתנה x. השיפוע הוא ההפרש של y חלקי ההפרש של x.',
      `ההפרש ב-y: ${m(`${sgn(y2)} − (${sgn(y1)})`)}. ההפרש ב-x: ${m(`${sgn(x2)} − (${sgn(x1)})`)}.`,
    ],
    solution: [`${m(`Δy = ${sgn(y2)} − (${sgn(y1)}) = ${sgn(y2 - y1)}`)}`, `${m(`Δx = ${sgn(x2)} − (${sgn(x1)}) = ${dx}`)}`, `שיפוע: ${m(`${sgn(y2 - y1)} ÷ ${dx} = ${sgn(ans)}`)}`],
    mistakes: mistakes(isNum(ans), [numMistake(dx / (y2 - y1), 'הפכת את החילוק: השיפוע הוא ההפרש של y חלקי ההפרש של x.'), numMistake(-ans, 'טעות בסימן. כדאי לחסר באותו סדר בשני ההפרשים.')]),
  };
}

// ---------- function.equation ----------
function equation(level: Level, rng: Rng): Exercise {
  const id = 'function.equation';
  const mm = nz(rng, -4, 4);
  const b = nz(rng, -6, 6);
  if (level === 1) {
    const right = m(lineText(mm, b));
    const wrongs = [m(lineText(b, mm)), m(lineText(mm, -b)), m(lineText(-mm, b))];
    return {
      subtopicId: id,
      level,
      prompt: `לישר יש שיפוע ${m(sgn(mm))}, והוא חותך את ציר y בנקודה ${m(pt(0, b))}. מה הייצוג האלגברי שלו?`,
      answer: choiceOf(rng, right, wrongs),
      hints: [
        'צריך לבנות את הנוסחה y = mx + b מתוך שני הנתונים.',
        'השיפוע הוא m, המספר שכופל את x. נקודת החיתוך עם ציר y נותנת את b, המספר החופשי. מציבים ובודקים גם את הסימנים.',
        `m = ${sgn(mm)}, וגם b = ${sgn(b)}.`,
      ],
      solution: [`${m(`m = ${sgn(mm)}`)}, ${m(`b = ${sgn(b)}`)}`, `${right}`],
      mistakes: [],
    };
  }
  const x0 = nz(rng, -4, 5);
  const y0 = mm * x0 + b;
  if (level === 2) {
    return {
      subtopicId: id,
      level,
      prompt: `לישר ${m(`y = ${mm === 1 ? '' : mm === -1 ? '−' : sgn(mm)}x + b`)} יש שיפוע ${m(sgn(mm))}, והוא עובר בנקודה ${m(pt(x0, y0))}. מה b?`,
      answer: { kind: 'number', value: b },
      hints: [
        'השיפוע ידוע, וחסר רק b. הנקודה הנתונה נמצאת על הישר, ולכן היא "מקיימת" את הנוסחה.',
        'מציבים את ה-x וה-y של הנקודה בנוסחה, ומקבלים משוואה שבה הנעלם היחיד הוא b.',
        `הציבי: ${m(`${sgn(y0)} = ${sgn(mm)} × (${sgn(x0)}) + b`)}`,
      ],
      solution: [`${m(`${sgn(y0)} = ${sgn(mm * x0)} + b`)}`, `${m(`b = ${sgn(y0)} − (${sgn(mm * x0)}) = ${sgn(b)}`)}`, `הישר: ${m(lineText(mm, b))}`],
      mistakes: mistakes(isNum(b), [numMistake(y0 + mm * x0, `העברת את ${m(sgn(mm * x0))} עם סימן הפוך.`), numMistake(y0, 'זה ה-y של הנקודה. b הוא ה-y של הנקודה שבה x = 0.')]),
    };
  }
  const x1 = x0 + int(rng, 1, 3);
  const y1 = mm * x1 + b;
  const right = m(lineText(mm, b));
  const wrongs = [m(lineText(-mm, y0 + mm * x0)), m(lineText(mm, y0)), m(lineText(mm, -b))];
  return {
    subtopicId: id,
    level,
    prompt: `ישר עובר בנקודות ${m(pt(x0, y0))} ו-${m(pt(x1, y1))}. מה הייצוג האלגברי שלו?`,
    answer: choiceOf(rng, right, wrongs),
    hints: [
      'צריך גם את m וגם את b, והנתונים הם שתי נקודות.',
      'קודם מחשבים את השיפוע משתי הנקודות (שינוי ב-y חלקי שינוי ב-x). אחר כך מציבים אחת הנקודות ב-y = mx + b ומוצאים את b.',
      `השיפוע: ${m(`(${sgn(y1)} − (${sgn(y0)})) ÷ (${sgn(x1)} − (${sgn(x0)}))`)}`,
    ],
    solution: [`שיפוע: ${m(`${sgn(y1 - y0)} ÷ ${x1 - x0} = ${sgn(mm)}`)}`, `הצבת ${m(pt(x0, y0))}: ${m(`${sgn(y0)} = ${sgn(mm * x0)} + b`)}, ולכן ${m(`b = ${sgn(b)}`)}`, right],
    mistakes: [],
  };
}

// ---------- function.sign ----------
function sign(level: Level, rng: Rng): Exercise {
  const id = 'function.sign';
  const mm = nz(rng, -3, 3);
  const x0 = int(rng, -4, 4);
  const b = -mm * x0;
  if (level === 1) {
    return {
      subtopicId: id,
      level,
      prompt: `באיזה ערך של x הישר ${m(lineText(mm, b))} חותך את ציר x?`,
      answer: { kind: 'number', value: x0 },
      hints: [
        'שואלים איפה הישר חוצה את הציר האופקי. בכל נקודה על ציר x, הגובה (y) הוא 0.',
        'מציבים y = 0 בפונקציה ופותרים את המשוואה שמתקבלת.',
        `המשוואה: ${m(`0 = ${lineText(mm, b).slice(4)}`)}`,
      ],
      solution: [`${m(`0 = ${lineText(mm, b).slice(4)}`)}`, `${m(`x = ${sgn(x0)}`)}`],
      mistakes: mistakes(isNum(x0), [numMistake(b, 'זו נקודת החיתוך עם ציר **y**. כאן שואלים על ציר x, שם y = 0.'), numMistake(-x0, 'טעות בסימן בפתרון המשוואה.')]),
    };
  }
  const askPositive = rng() < 0.5;
  const positiveRight = mm > 0; // y > 0 when x > x0
  const greaterIsRight = askPositive ? positiveRight : !positiveRight;
  const right = m(greaterIsRight ? `x > ${sgn(x0)}` : `x < ${sgn(x0)}`);
  const wrongs = [m(greaterIsRight ? `x < ${sgn(x0)}` : `x > ${sgn(x0)}`), m(`x > ${sgn(b)}`), 'לכל x'];
  return {
    subtopicId: id,
    level,
    prompt:
      level === 2
        ? `מהו תחום ה${askPositive ? 'חיוביות' : 'שליליות'} של הפונקציה ${m(lineText(mm, b))}?`
        : `מהו תחום ה${askPositive ? 'חיוביות' : 'שליליות'} של הפונקציה שבגרף?`,
    answer: choiceOf(rng, right, wrongs),
    hints: [
      `תחום ה${askPositive ? 'חיוביות' : 'שליליות'} = כל ערכי x שבהם הישר נמצא ${askPositive ? '**מעל**' : '**מתחת**'} לציר x (כלומר y ${askPositive ? 'חיובי' : 'שלילי'}).`,
      'שני דברים קובעים את התשובה: איפה הישר חוצה את ציר x (שם הוא מחליף סימן), והאם הוא עולה או יורד. ישר עולה נמצא מעל הציר מימין לנקודת החיתוך.',
      level === 2 ? `נקודת החיתוך עם ציר x: הציבי y = 0. האם השיפוע ${m(sgn(mm))} חיובי או שלילי?` : 'מצאי בגרף איפה הישר חוצה את ציר x, ובדקי אם הוא עולה או יורד.',
    ],
    solution: [
      `הישר חותך את ציר x ב-${m(`x = ${sgn(x0)}`)}.`,
      `השיפוע ${mm > 0 ? 'חיובי, הישר עולה' : 'שלילי, הישר יורד'}: הוא מעל הציר כש-${m(positiveRight ? `x > ${sgn(x0)}` : `x < ${sgn(x0)}`)}.`,
      `לכן התשובה: ${right}.`,
    ],
    mistakes: [],
    visual: level === 3 ? { type: 'graph', lines: [{ m: mm, b }], points: [] } : undefined,
  };
}

// ---------- function.compare ----------
function compare(level: Level, rng: Rng): Exercise {
  const id = 'function.compare';
  if (level === 1) {
    const m1 = int(rng, 1, 5);
    let m2 = int(rng, 1, 5);
    if (m1 === m2) m2 = m1 + 1;
    // The less steep line gets the bigger b, so "bigger number" isn't a shortcut.
    const [b1, b2] = m1 > m2 ? [int(rng, -6, 0), int(rng, 1, 7)] : [int(rng, 1, 7), int(rng, -6, 0)];
    const options = [m(lineText(m1, b1)), m(lineText(m2, b2))];
    return {
      subtopicId: id,
      level,
      prompt: `איזה מהישרים עולה בצורה תלולה יותר (עולה מהר יותר)?`,
      answer: { kind: 'choice', options, correct: m1 > m2 ? 0 : 1 },
      hints: [
        'שואלים איזה ישר "מטפס" מהר יותר כשזזים ימינה.',
        'מה שקובע את התלילות הוא השיפוע, המספר שכופל את x. ה-b רק מזיז את הישר למעלה או למטה, ולא משנה את התלילות.',
        'השווי את המספרים שלפני x בשתי הנוסחאות.',
      ],
      solution: ['ישר תלול יותר = שיפוע גדול יותר.', `השיפועים: ${m(m1)} ו-${m(m2)}. הגדול: ${m(Math.max(m1, m2))}.`],
      mistakes: [],
    };
  }
  let m1 = nz(rng, -3, 3);
  let m2 = nz(rng, -3, 3);
  if (m1 === m2) m2 = m1 === 3 ? -1 : m1 + 1;
  const x = int(rng, -3, 3);
  const y = int(rng, -4, 4);
  const b1 = y - m1 * x;
  const b2 = y - m2 * x;
  if (Math.abs(b1) > 7 || Math.abs(b2) > 7) return compare(level, rng);
  const ans = level === 2 ? x : y;
  return {
    subtopicId: id,
    level,
    prompt:
      level === 2
        ? `באיזה ערך של x נחתכים הישרים ${m(lineText(m1, b1))} ו-${m(lineText(m2, b2))}?`
        : `בגרף מתוארים הישרים ${m(lineText(m1, b1))} ו-${m(lineText(m2, b2))}. מה ערך y בנקודת החיתוך שלהם?`,
    answer: { kind: 'number', value: ans },
    hints: [
      'בנקודת החיתוך שני הישרים נפגשים: יש להם אותו x ואותו y.',
      'משווים בין שתי הנוסחאות (כי ה-y שלהן שווה שם), ופותרים את המשוואה כדי למצוא את x.' + (level === 3 ? ' אחר כך מציבים את x באחת הנוסחאות כדי לקבל את y.' : ''),
      `המשוואה: ${m(`${lineText(m1, b1).slice(4)} = ${lineText(m2, b2).slice(4)}`)}`,
    ],
    solution: [`${m(`${lineText(m1, b1).slice(4)} = ${lineText(m2, b2).slice(4)}`)}`, `${m(`x = ${sgn(x)}`)}`, level === 3 ? `מציבים: ${m(`y = ${sgn(y)}`)}. נקודת החיתוך ${m(pt(x, y))}.` : `נקודת החיתוך ${m(pt(x, y))}.`],
    mistakes: mistakes(isNum(ans), [level === 2 ? numMistake(y, 'זה ערך ה-y של נקודת החיתוך. השאלה שואלת על x.') : numMistake(x, 'זה ערך ה-x של נקודת החיתוך. השאלה שואלת על y.')]),
    visual: { type: 'graph', lines: [{ m: m1, b: b1 }, { m: m2, b: b2 }], points: level === 3 ? [] : [] },
  };
}

export const functionUnit: UnitContent = {
  hook: {
    title: 'המונית',
    text: 'במונית יש דמי פתיחה, נניח 12 ש"ח, ועוד 3 ש"ח לכל ק"מ. כמה עולה נסיעה של x ק"מ? בדיוק y = 3x + 12. כל פונקציה קווית היא "מונית": b הוא דמי הפתיחה, ו-m הוא המחיר לכל צעד.',
  },
  tricks: [
    'y = mx + b: m = השיפוע (כמה עולים בכל צעד), b = איפה חותכים את ציר y.',
    'חיתוך עם ציר y: מציבים x = 0. חיתוך עם ציר x: מציבים y = 0.',
    'שיפוע משתי נקודות: שינוי ב-y חלקי שינוי ב-x.',
    'נקודת חיתוך של שני ישרים: משווים את הנוסחאות.',
  ],
  commonMistakes: [
    { title: 'לבלבל בין m ל-b', text: 'ב-{{y = 2x + 5}} השיפוע הוא 2 (צמוד ל-x), ו-5 הוא נקודת החיתוך עם ציר y.' },
    { title: 'שיפוע הפוך', text: 'שיפוע = Δy ÷ Δx, ולא Δx ÷ Δy. "כמה עולים" חלקי "כמה הולכים".' },
    { title: 'סימנים בהצבה', text: 'מציבים מספר שלילי בסוגריים: {{2 × (−3) = −6}}.' },
  ],
  subtopics: [
    {
      id: 'function.concept',
      title: 'מהי פונקציה: ייצוגים והצבה',
      addedIn: V,
      generate: concept,
      explanations: [
        {
          label: 'מכונה',
          title: 'פונקציה = מכונה',
          paragraphs: [
            'מכניסים מספר (x), המכונה עושה עליו פעולה קבועה, ויוצא מספר (y).',
            'ב-{{y = 2x + 1}}: נכנס 3, יוצא {{2 × 3 + 1 = 7}}.',
            'אותה פונקציה אפשר לתאר במילים, בטבלה, בגרף או בנוסחה. אלה ארבעה **ייצוגים** של אותו דבר.',
          ],
        },
        {
          label: 'טבלה',
          title: 'לגלות את החוק מטבלה',
          paragraphs: ['בפונקציה קווית, כל צעד של 1 ב-x משנה את y באותו מספר. זה השיפוע.', 'ה-y כש-x = 0 הוא b.'],
          example: { question: 'x: 0, 1, 2 · y: 5, 8, 11', steps: ['בכל צעד y עולה ב-3, אז {{m = 3}}', 'כש-x = 0, y = 5, אז {{b = 5}}', '{{y = 3x + 5}}'] },
        },
      ],
    },
    {
      id: 'function.slope',
      title: 'שיפוע ונקודת חיתוך עם ציר y',
      addedIn: V,
      generate: slope,
      explanations: [
        {
          label: 'הדמיה',
          title: 'לשחק עם m ו-b',
          interactive: 'lineExplorer',
          paragraphs: ['שני את m וראי איך הישר מסתובב: m גדול יותר אומר ישר תלול יותר, ו-m שלילי אומר ישר יורד.', 'שני את b וראי איך הישר זז למעלה ולמטה בלי להסתובב.'],
        },
        {
          label: 'מדרגות',
          title: 'שיפוע = מדרגות',
          paragraphs: ['דמייני מדרגות: כל צעד ימינה, כמה עולים?', 'שיפוע 2: צעד ימינה, שניים למעלה. שיפוע −1: צעד ימינה, אחד למטה.', 'y = x ו-y = −x הם ישרים שעוברים בראשית הצירים, עם שיפוע 1 ו-−1.'],
        },
      ],
    },
    {
      id: 'function.equation',
      title: 'מציאת הייצוג האלגברי של ישר',
      addedIn: V,
      generate: equation,
      explanations: [
        {
          label: 'שיפוע ונקודה',
          title: 'משיפוע ונקודה',
          paragraphs: ['כותבים y = mx + b עם השיפוע הידוע.', 'מציבים את הנקודה (x ו-y שלה), ופותרים בשביל b.'],
          example: { question: 'שיפוע 2, נקודה (3, 10)', steps: ['{{10 = 2 × 3 + b}}', '{{b = 4}}', '{{y = 2x + 4}}'] },
        },
        {
          label: 'שתי נקודות',
          title: 'משתי נקודות',
          paragraphs: ['1. מחשבים את השיפוע: {{Δy ÷ Δx}}.', '2. מציבים אחת הנקודות ומוצאים את b.', '3. בודקים עם הנקודה השנייה.'],
          example: { question: '(1, 5) ו-(3, 9)', steps: ['שיפוע: {{(9 − 5) ÷ (3 − 1) = 2}}', '{{5 = 2 × 1 + b}}, אז {{b = 3}}', '{{y = 2x + 3}}. בדיקה: {{2 × 3 + 3 = 9}} ✓'] },
        },
      ],
    },
    {
      id: 'function.sign',
      title: 'חיתוך עם ציר x, תחומי חיוביות ושליליות',
      addedIn: V,
      generate: sign,
      explanations: [
        {
          label: 'מעל ומתחת',
          title: 'מעל הציר = חיובי',
          interactive: 'lineExplorer',
          paragraphs: [
            '**תחום חיוביות**: איפה הישר מעל ציר x (y > 0). **תחום שליליות**: איפה הוא מתחת (y < 0).',
            'הגבול ביניהם הוא נקודת החיתוך עם ציר x, שם y = 0.',
          ],
        },
        {
          label: 'שיטה',
          title: 'שני צעדים',
          paragraphs: ['1. מציבים y = 0 ומוצאים את נקודת החיתוך עם ציר x.', '2. ישר עולה (m > 0): חיובי מימין לנקודה. ישר יורד (m < 0): חיובי משמאל לנקודה.'],
          example: { question: '{{y = 2x − 6}}', steps: ['{{0 = 2x − 6}}, אז {{x = 3}}', 'עולה, ולכן חיובי כש-{{x > 3}} ושלילי כש-{{x < 3}}'] },
        },
      ],
    },
    {
      id: 'function.compare',
      title: 'השוואת פונקציות ופתרון גרפי',
      addedIn: V,
      generate: compare,
      explanations: [
        {
          label: 'מפגש',
          title: 'איפה שני ישרים נפגשים',
          paragraphs: ['בנקודת המפגש יש לשני הישרים אותו x ואותו y.', 'לכן משווים בין הנוסחאות ופותרים: זה "פתרון גרפי" של משוואה.'],
          example: { question: '{{y = 2x + 1}} ו-{{y = x + 4}}', steps: ['{{2x + 1 = x + 4}}', '{{x = 3}}', '{{y = 7}}, נקודת המפגש {{(3, 7)}}'] },
        },
        {
          label: 'מנויים',
          title: 'איזה מנוי משתלם?',
          paragraphs: ['מנוי א: 20 ש"ח + 5 לכל כניסה. מנוי ב: 10 לכל כניסה.', 'נקודת החיתוך ({{x = 4}}) מראה מתי הם עולים אותו דבר.', 'אחרי 4 כניסות, מנוי א זול יותר, כי השיפוע שלו קטן יותר.'],
        },
      ],
    },
  ],
};
