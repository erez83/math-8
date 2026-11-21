import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, shuffle, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake } from '../helpers';
import { fmt } from '../../lib/answer';

const V = '0.4.0';

const PETS = ['כלב', 'חתול', 'דג', 'ציפור', 'ארנב'];
const SPORTS = ['כדורגל', 'כדורסל', 'שחייה', 'ריקוד', 'טניס'];
const list = (xs: number[]) => m(xs.join(', '));

/** Frequencies that sum to `total`, each ≥ 1. */
function splitTotal(rng: Rng, total: number, n: number, mult = 1): number[] {
  for (;;) {
    const parts = Array.from({ length: n - 1 }, () => int(rng, 1, Math.floor(total / mult / 2)) * mult);
    const last = total - parts.reduce((s, v) => s + v, 0);
    if (last >= mult && last % mult === 0) return [...parts, last];
  }
}

// ---------- statistics.frequency ----------
function frequency(level: Level, rng: Rng): Exercise {
  const id = 'statistics.frequency';
  const total = level === 1 ? int(rng, 12, 30) : pick(rng, [20, 25, 40, 50]);
  const values = [0, 1, 2, 3, 4];
  const freq = splitTotal(rng, total, 5, level === 1 ? 1 : total === 25 ? 1 : total / 20 >= 2 ? 2 : 1);
  const rows: (string | number)[][] = [['מספר אחים', ...values], ['שכיחות (מספר תלמידים)', ...freq]];
  if (level === 1) {
    return {
      subtopicId: id,
      level,
      prompt: 'בסקר בכיתה שאלו כל תלמיד כמה אחים יש לו. כמה תלמידים השתתפו בסקר?',
      answer: { kind: 'number', value: total, unit: 'תלמידים' },
      hints: [
        'בטבלה, השורה התחתונה (שכיחות) אומרת כמה תלמידים ענו כל תשובה.',
        'כל תלמיד נספר פעם אחת, באחת העמודות. לכן מספר המשתתפים הוא סכום כל השכיחויות. לא סכום מספר האחים!',
        `חברי: ${m(freq.join(' + '))}`,
      ],
      solution: [`${m(`${freq.join(' + ')} = ${total}`)}`],
      mistakes: mistakes(isNum(total), [numMistake(10, 'חיברת את מספרי האחים (0 עד 4). צריך לחבר את השכיחויות: כמה תלמידים ענו.'), numMistake(5, 'זה מספר העמודות (התשובות האפשריות), לא מספר התלמידים.')]),
      visual: { type: 'table', rows },
    };
  }
  const i = int(rng, 0, 4);
  const rel = (freq[i] / total) * 100;
  if (level === 2) {
    return {
      subtopicId: id,
      level,
      prompt: `בסקר השתתפו ${m(total)} תלמידים. מה השכיחות **היחסית** של תלמידים עם ${m(values[i])} אחים, באחוזים?`,
      answer: { kind: 'number', value: rel, unit: '%' },
      hints: [
        'שכיחות יחסית = איזה **חלק** מכל המשתתפים בחרו בתשובה הזו. באחוזים.',
        'מחלקים את השכיחות של התשובה בסך כל המשתתפים, ומכפילים ב-100 כדי לקבל אחוזים.',
        `השכיחות היא ${m(freq[i])}. החלק: ${m(`${freq[i]}/${total}`)}`,
      ],
      solution: [`${m(`${freq[i]} ÷ ${total} = ${fmt(freq[i] / total)}`)}`, `${m(`${fmt(freq[i] / total)} × 100 = ${fmt(rel)}%`)}`],
      mistakes: mistakes(isNum(rel), [numMistake(freq[i], 'זו השכיחות (מספר התלמידים). השכיחות **היחסית** היא החלק מכלל המשתתפים.'), numMistake(freq[i] / total, 'זה החלק כמספר עשרוני. כדי לקבל אחוזים, כופלים ב-100.')]),
      visual: { type: 'table', rows },
    };
  }
  const pet = pick(rng, PETS);
  const N = pick(rng, [40, 60, 80, 120, 200]);
  const p = pick(rng, [10, 15, 20, 25, 30, 35, 40, 45]);
  const ans = (N * p) / 100;
  return {
    subtopicId: id,
    level,
    prompt: `בסקר על חיית מחמד אהובה השתתפו ${m(N)} תלמידים. השכיחות היחסית של "${pet}" היא ${m(p + '%')}. כמה תלמידים בחרו ב"${pet}"?`,
    answer: { kind: 'number', value: ans, unit: 'תלמידים' },
    hints: [
      'הפעם נתונה השכיחות היחסית (באחוזים), ושואלים על השכיחות עצמה, כלומר מספר התלמידים.',
      `שכיחות יחסית של ${m(p + '%')} פירושה ש-${m(p + '%')} מכל המשתתפים בחרו בזה. מחשבים ${m(p + '%')} מתוך ${m(N)}.`,
      `1% מ-${m(N)} = ${m(`${N} ÷ 100`)}. כפלי ב-${m(p)}.`,
    ],
    solution: [`${m(`${N} ÷ 100 × ${p} = ${fmt(ans)}`)} תלמידים.`],
    mistakes: mistakes(isNum(ans), [numMistake(p, 'זה האחוז, לא מספר התלמידים. צריך לחשב כמה זה מתוך המשתתפים.')]),
  };
}

// ---------- statistics.charts ----------
function charts(level: Level, rng: Rng): Exercise {
  const id = 'statistics.charts';
  const labels = shuffle(rng, SPORTS).slice(0, 4);
  const step = 2;
  const values = labels.map(() => int(rng, 1, 9) * step);
  if (new Set(values).size < 4) return charts(level, rng);
  if (level === 1) {
    const i = int(rng, 0, 3);
    return {
      subtopicId: id,
      level,
      prompt: `בדיאגרמה מוצג מספר התלמידים שבחרו כל ענף ספורט. כמה תלמידים בחרו ב${labels[i]}?`,
      answer: { kind: 'number', value: values[i], unit: 'תלמידים' },
      hints: [
        'בדיאגרמת עמודות, הגובה של כל עמודה מראה את הכמות.',
        'מוצאים את העמודה הנכונה, ומסתכלים לאיזה קו בציר האנכי מגיע הראש שלה. כל קו שווה למספר שכתוב לידו.',
        `חפשי את העמודה "${labels[i]}" והשווי את הראש שלה לקווי הרשת.`,
      ],
      solution: [`העמודה של ${labels[i]} מגיעה ל-${m(values[i])}.`],
      mistakes: [],
      visual: { type: 'barChart', labels, values, step },
    };
  }
  if (level === 2) {
    const [i, j] = shuffle(rng, [0, 1, 2, 3]).slice(0, 2);
    const hi = values[i] > values[j] ? i : j;
    const lo = hi === i ? j : i;
    const ans = values[hi] - values[lo];
    return {
      subtopicId: id,
      level,
      prompt: `לפי הדיאגרמה, בכמה תלמידים יותר בחרו ב${labels[hi]} מאשר ב${labels[lo]}?`,
      answer: { kind: 'number', value: ans, unit: 'תלמידים' },
      hints: [
        'שואלים על **הפרש** בין שתי עמודות, לא על כל אחת לבד.',
        'קוראים את הגובה של כל אחת משתי העמודות, ומחסירים את הקטן מהגדול.',
        `קראי את הגובה של "${labels[hi]}" ושל "${labels[lo]}".`,
      ],
      solution: [`${labels[hi]}: ${m(values[hi])}, ${labels[lo]}: ${m(values[lo])}.`, `${m(`${values[hi]} − ${values[lo]} = ${ans}`)}`],
      mistakes: mistakes(isNum(ans), [numMistake(values[hi] + values[lo], 'חיברת. "בכמה יותר" זה הפרש, כלומר חיסור.')]),
      visual: { type: 'barChart', labels, values, step },
    };
  }
  const N = pick(rng, [40, 80, 120, 200, 400]);
  const percents = [pick(rng, [40, 35, 45]), pick(rng, [25, 20, 30])];
  percents.push(100 - percents[0] - percents[1] - 10, 10);
  const pl = shuffle(rng, PETS).slice(0, 4);
  const i = int(rng, 0, 3);
  const ans = (N * percents[i]) / 100;
  return {
    subtopicId: id,
    level,
    prompt: `בסקר השתתפו ${m(N)} תלמידים, והתוצאות מוצגות בדיאגרמת עוגה. כמה תלמידים בחרו ב"${pl[i]}"?`,
    answer: { kind: 'number', value: ans, unit: 'תלמידים' },
    hints: [
      'דיאגרמת עוגה מראה **חלקים מהשלם** באחוזים. השלם (100%) הוא כל המשתתפים.',
      'מוצאים את האחוז של הגזרה המבוקשת, ומחשבים כמה זה מתוך מספר המשתתפים.',
      `הגזרה של "${pl[i]}" היא ${m(percents[i] + '%')}. כמה זה מ-${m(N)}?`,
    ],
    solution: [`${m(`${percents[i]}% × ${N} = ${N} ÷ 100 × ${percents[i]} = ${fmt(ans)}`)}`],
    mistakes: mistakes(isNum(ans), [numMistake(percents[i], 'זה האחוז, לא מספר התלמידים.')]),
    visual: { type: 'pie', labels: pl, percents },
  };
}

// ---------- statistics.mode-range ----------
function modeRange(level: Level, rng: Rng): Exercise {
  const id = 'statistics.mode-range';
  const n = level === 1 ? 7 : 8;
  let data: number[];
  let mode: number;
  for (;;) {
    data = Array.from({ length: n }, () => int(rng, 2, 20));
    const mode0 = data[0];
    data[1] = mode0;
    data[2] = mode0;
    const counts = new Map<number, number>();
    data.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1));
    const max = Math.max(...counts.values());
    const modes = [...counts.entries()].filter(([, c]) => c === max);
    if (modes.length === 1) {
      mode = modes[0][0];
      break;
    }
  }
  data = shuffle(rng, data);
  const min = Math.min(...data);
  const max = Math.max(...data);
  if (level === 1) {
    return {
      subtopicId: id,
      level,
      prompt: `אלה מספר השעות שתלמידים ישנו בסוף שבוע: ${list(data)}. מה **השכיח**?`,
      answer: { kind: 'number', value: mode },
      hints: [
        'השכיח הוא הנתון שמופיע **הכי הרבה פעמים**.',
        'סופרים כמה פעמים מופיע כל מספר. כדאי לסדר את המספרים מהקטן לגדול, ואז חזרות בולטות מיד.',
        `סדרי: ${list([...data].sort((a, b) => a - b))}`,
      ],
      solution: [`${m(mode)} מופיע הכי הרבה פעמים.`],
      mistakes: mistakes(isNum(mode), [numMistake(max, 'זה הנתון הגדול ביותר. השכיח הוא הנתון שחוזר הכי הרבה.')]),
    };
  }
  if (level === 2) {
    return {
      subtopicId: id,
      level,
      prompt: `ציוני תלמידים בבוחן (מתוך 20): ${list(data)}. מה **הטווח**?`,
      answer: { kind: 'number', value: max - min },
      hints: [
        'הטווח מודד כמה הנתונים "מפוזרים": המרחק בין הקטן ביותר לגדול ביותר.',
        'מוצאים את הנתון הגדול ביותר ואת הקטן ביותר, ומחסירים.',
        `הגדול ביותר: ${m(max)}. והקטן ביותר?`,
      ],
      solution: [`הגדול: ${m(max)}, הקטן: ${m(min)}.`, `טווח: ${m(`${max} − ${min} = ${max - min}`)}`],
      mistakes: mistakes(isNum(max - min), [numMistake(max, 'זה הנתון הגדול ביותר. הטווח הוא ההפרש בין הגדול לקטן.'), numMistake(mode, 'זה השכיח. הטווח הוא ההפרש בין הגדול לקטן.')]),
    };
  }
  const kind = pick(rng, ['bigger', 'smaller', 'inside'] as const);
  const add = kind === 'bigger' ? max + int(rng, 1, 8) : kind === 'smaller' ? Math.max(0, min - int(rng, 1, 2)) : int(rng, min, max);
  const changes = add > max || add < min;
  const options = ['הטווח יגדל', 'הטווח יקטן', 'הטווח לא ישתנה'];
  return {
    subtopicId: id,
    level,
    prompt: `הנתונים: ${list(data)}. מוסיפים לנתונים את המספר ${m(add)}. מה יקרה לטווח?`,
    answer: { kind: 'choice', options, correct: changes ? 0 : 2 },
    hints: [
      'הטווח תלוי רק בשני נתונים: הגדול ביותר והקטן ביותר.',
      'בודקים אם הנתון החדש משנה את הגדול ביותר או את הקטן ביותר. אם הוא נמצא ביניהם, הטווח לא משתנה. שימי לב: הוספת נתון לא יכולה להקטין את הטווח.',
      `הקטן ביותר: ${m(min)}, הגדול ביותר: ${m(max)}. איפה נמצא ${m(add)}?`,
    ],
    solution: [
      `לפני: ${m(`${max} − ${min} = ${max - min}`)}.`,
      changes ? `${m(add)} נמצא מחוץ לתחום, אז הטווח גדל.` : `${m(add)} נמצא בתוך התחום, אז הטווח לא משתנה.`,
    ],
    mistakes: [],
  };
}

// ---------- statistics.mean ----------
function mean(level: Level, rng: Rng): Exercise {
  const id = 'statistics.mean';
  if (level === 1) {
    const n = int(rng, 4, 6);
    const avg = int(rng, 5, 15);
    const data = Array.from({ length: n - 1 }, () => avg + int(rng, -4, 4));
    data.push(avg * n - data.reduce((s, v) => s + v, 0));
    if (data[n - 1] <= 0) return mean(level, rng);
    const sum = avg * n;
    return {
      subtopicId: id,
      level,
      prompt: `מאיה קראה כל יום מספר עמודים: ${list(data)}. מה הממוצע היומי?`,
      answer: { kind: 'number', value: avg, unit: 'עמודים' },
      hints: [
        'הממוצע הוא "כמה היה בכל יום אילו כל הימים היו שווים".',
        'מחברים את כל הנתונים, ומחלקים במספר הנתונים (כמה ימים היו).',
        `הסכום: ${m(data.join(' + '))}. כמה ימים יש?`,
      ],
      solution: [`סכום: ${m(sum)}.`, `${m(`${sum} ÷ ${n} = ${avg}`)}`],
      mistakes: mistakes(isNum(avg), [numMistake(sum, 'זה הסכום. הממוצע הוא הסכום חלקי מספר הנתונים.'), numMistake(sum / (n - 1), `חילקת ב-${m(n - 1)}. יש ${m(n)} נתונים.`)]),
    };
  }
  if (level === 2) {
    const n = 5;
    const avg = int(rng, 70, 90);
    const known = Array.from({ length: 4 }, () => avg + int(rng, -12, 12));
    const missingVal = avg * n - known.reduce((s, v) => s + v, 0);
    if (missingVal < 40 || missingVal > 100) return mean(level, rng);
    return {
      subtopicId: id,
      level,
      prompt: `הממוצע של ${m(5)} ציונים הוא ${m(avg)}. ארבעה מהם: ${list(known)}. מה הציון החמישי?`,
      answer: { kind: 'number', value: missingVal },
      hints: [
        'הממוצע ידוע, וחסר נתון אחד. הממוצע "יודע" מה הסכום של כל הציונים.',
        'ממוצע × מספר הנתונים = הסכום של כולם. מחסירים מהסכום את מה שכבר ידוע, ומה שנשאר הוא הציון החסר.',
        `סכום כל הציונים: ${m(`${avg} × 5`)}`,
      ],
      solution: [`סכום הכול: ${m(`${avg} × 5 = ${avg * 5}`)}.`, `סכום הידועים: ${m(known.reduce((s, v) => s + v, 0))}.`, `החסר: ${m(`${avg * 5} − ${known.reduce((s, v) => s + v, 0)} = ${missingVal}`)}`],
      mistakes: mistakes(isNum(missingVal), [numMistake(avg, 'הציון החסר הוא לא בהכרח הממוצע. צריך לבדוק מה חסר בסכום.')]),
    };
  }
  const n = int(rng, 3, 6);
  const avg = int(rng, 6, 15);
  const add = avg + n + 1 + int(rng, 0, 4) * (n + 1);
  const newAvg = (avg * n + add) / (n + 1);
  if (!Number.isInteger(newAvg * 10)) return mean(level, rng);
  return {
    subtopicId: id,
    level,
    prompt: `הממוצע של ${m(n)} מספרים הוא ${m(avg)}. מוסיפים מספר נוסף: ${m(add)}. מה הממוצע החדש?`,
    answer: { kind: 'number', value: newAvg },
    hints: [
      'לא יודעים את המספרים עצמם, אבל אפשר לדעת את הסכום שלהם מהממוצע.',
      'סכום = ממוצע × כמות. מוסיפים לסכום את המספר החדש, ומחלקים במספר הנתונים **החדש**.',
      `הסכום לפני: ${m(`${avg} × ${n}`)}`,
    ],
    solution: [`סכום לפני: ${m(avg * n)}.`, `סכום חדש: ${m(`${avg * n} + ${add} = ${avg * n + add}`)}.`, `${m(`${avg * n + add} ÷ ${n + 1} = ${fmt(newAvg)}`)}`],
    mistakes: mistakes(isNum(newAvg), [numMistake((avg + add) / 2, 'חישבת ממוצע של הממוצע הישן עם המספר החדש. אבל הממוצע הישן "מייצג" כמה מספרים, לא אחד.'), numMistake((avg * n + add) / n, `חילקת ב-${m(n)}. עכשיו יש ${m(n + 1)} מספרים.`)]),
  };
}

// ---------- statistics.median ----------
function median(level: Level, rng: Rng): Exercise {
  const id = 'statistics.median';
  if (level === 3) {
    const values = [1, 2, 3, 4, 5];
    let freq: number[];
    let total: number;
    do {
      freq = values.map(() => int(rng, 1, 7));
      total = freq.reduce((s, v) => s + v, 0);
    } while (total % 2 === 0);
    const sorted = values.flatMap((v, i) => Array(freq[i]).fill(v));
    const med = sorted[(total - 1) / 2];
    return {
      subtopicId: id,
      level,
      prompt: `הטבלה מראה כמה ספרים קראו תלמידי הכיתה בחופש. מה החציון?`,
      answer: { kind: 'number', value: med, unit: 'ספרים' },
      hints: [
        'החציון הוא הנתון **האמצעי** כשכל הנתונים מסודרים. כאן כל תלמיד הוא נתון אחד.',
        'סופרים כמה תלמידים יש בסך הכול, ומוצאים את המקום האמצעי. אחר כך "הולכים" לאורך הטבלה ומצטברים, עד שמגיעים למקום הזה.',
        `סך התלמידים: ${m(total)}. המקום האמצעי: ${m((total + 1) / 2)}.`,
      ],
      solution: [`${m(total)} תלמידים, האמצעי הוא במקום ${m((total + 1) / 2)}.`, `מצטברים לפי הטבלה: מקום ${m((total + 1) / 2)} נופל על ${m(med)}.`],
      mistakes: mistakes(isNum(med), [numMistake(3, 'זה האמצע של עמודת "מספר הספרים", אבל החציון תלוי בכמה תלמידים קראו כל מספר.')]),
      visual: { type: 'table', rows: [['ספרים', ...values], ['מספר תלמידים', ...freq]] },
    };
  }
  const n = level === 1 ? pick(rng, [5, 7, 9]) : pick(rng, [6, 8]);
  const data = Array.from({ length: n }, () => int(rng, 1, 30));
  const sorted = [...data].sort((a, b) => a - b);
  const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const unsortedMid = n % 2 ? data[(n - 1) / 2] : (data[n / 2 - 1] + data[n / 2]) / 2;
  return {
    subtopicId: id,
    level,
    prompt: `מה החציון של הנתונים: ${list(data)}?`,
    answer: { kind: 'number', value: med },
    hints: [
      'החציון הוא הנתון שנמצא **באמצע**: חצי מהנתונים קטנים ממנו וחצי גדולים ממנו.',
      'קודם **מסדרים** מהקטן לגדול. ' + (n % 2 ? 'במספר אי-זוגי של נתונים יש נתון אחד באמצע.' : 'במספר זוגי של נתונים יש שניים באמצע, והחציון הוא הממוצע שלהם.'),
      `מסודר: ${list(sorted)}`,
    ],
    solution: [`מסודר: ${list(sorted)}.`, n % 2 ? `האמצעי: ${m(med)}.` : `שני האמצעיים: ${m(sorted[n / 2 - 1])} ו-${m(sorted[n / 2])}. ממוצע: ${m(fmt(med))}.`],
    mistakes: mistakes(isNum(med), [numMistake(unsortedMid, 'לקחת את האמצעי בלי לסדר קודם. חייבים לסדר מהקטן לגדול.')]),
  };
}

export const statisticsUnit: UnitContent = {
  hook: {
    title: 'מיליונר בחדר',
    text: 'בחדר 9 אנשים, כל אחד מרוויח 10,000 ש"ח. נכנס מיליונר. פתאום "הממוצע" הוא 100,000 ש"ח, אבל אף אחד לא נהיה עשיר יותר. סטטיסטיקה עוזרת להבין מה המספרים באמת אומרים, ולא ליפול בטריקים כאלה.',
  },
  tricks: [
    'שכיחות = כמה פעמים. שכיחות יחסית = איזה חלק מהכול (באחוזים).',
    'ממוצע = סכום ÷ כמות. סכום = ממוצע × כמות.',
    'חציון: קודם מסדרים! ואז האמצעי.',
    'טווח = הגדול פחות הקטן.',
  ],
  commonMistakes: [
    { title: 'חציון בלי לסדר', text: 'האמצעי של {{9, 2, 5}} הוא לא 2. מסדרים: {{2, 5, 9}}, והחציון הוא 5.' },
    { title: 'לחלק במספר לא נכון', text: 'בממוצע מחלקים במספר **הנתונים**, לא במספר הסוגים.' },
    { title: 'לבלבל שכיח עם שכיחות', text: 'השכיח הוא הנתון (למשל "2 אחים"). השכיחות שלו היא כמה פעמים הוא מופיע.' },
  ],
  subtopics: [
    {
      id: 'statistics.frequency',
      title: 'שכיחות ושכיחות יחסית',
      addedIn: V,
      generate: frequency,
      explanations: [
        {
          label: 'סקר',
          title: 'ארגון נתונים בטבלה',
          paragraphs: ['בסקר כל תלמיד עונה תשובה אחת. **שכיחות** = כמה תלמידים ענו כל תשובה.', 'סכום כל השכיחויות = מספר המשתתפים.', '**שכיחות יחסית** = השכיחות חלקי כל המשתתפים, בדרך כלל באחוזים.'],
          example: { question: '8 מתוך 40 תלמידים אוהבים שחייה', steps: ['שכיחות: 8', 'שכיחות יחסית: {{8 ÷ 40 = 0.2 = 20%}}'] },
        },
        {
          label: 'למה יחסית?',
          title: 'למה צריך שכיחות יחסית?',
          paragraphs: ['בכיתה א: 10 מתוך 20 אוהבים כדורגל. בכיתה ב: 12 מתוך 40.', 'בכיתה ב יותר תלמידים אוהבים כדורגל, אבל באחוזים: 50% מול 30%.', 'שכיחות יחסית מאפשרת להשוות קבוצות בגדלים שונים.'],
        },
      ],
    },
    {
      id: 'statistics.charts',
      title: 'דיאגרמת עמודות ודיאגרמת עוגה',
      addedIn: V,
      generate: charts,
      explanations: [
        {
          label: 'עמודות',
          title: 'קריאת דיאגרמת עמודות',
          paragraphs: ['כל עמודה היא קטגוריה, והגובה שלה הוא השכיחות.', 'קוראים את הגובה מול הציר האנכי, ושמים לב לגודל של כל משבצת בציר.', 'טובה במיוחד להשוואה: מי הכי הרבה, מי הכי מעט, ובכמה.'],
        },
        {
          label: 'עוגה',
          title: 'דיאגרמת עוגה',
          paragraphs: ['כל העוגה = 100% מהמשתתפים. כל גזרה היא חלק.', 'חצי עוגה = 50%, רבע עוגה = 25%.', 'כדי לדעת כמה אנשים בגזרה: האחוז שלה כפול מספר המשתתפים.'],
        },
      ],
    },
    {
      id: 'statistics.mode-range',
      title: 'שכיח וטווח',
      addedIn: V,
      generate: modeRange,
      explanations: [
        {
          label: 'שכיח',
          title: 'השכיח = הפופולרי',
          paragraphs: ['השכיח הוא הנתון שחוזר הכי הרבה פעמים, כמו המידה הכי נמכרת בחנות נעליים.', 'יכול להיות שאין שכיח אחד, אם כמה נתונים חוזרים אותו מספר פעמים.'],
        },
        {
          label: 'טווח',
          title: 'הטווח = כמה מפוזר',
          paragraphs: ['טווח = הגדול פחות הקטן.', 'ציונים 70 עד 90: טווח 20, קבוצה אחידה. ציונים 40 עד 100: טווח 60, קבוצה מגוונת.', 'הטווח תלוי רק בשני הקצוות.'],
        },
      ],
    },
    {
      id: 'statistics.mean',
      title: 'ממוצע',
      addedIn: V,
      generate: mean,
      explanations: [
        {
          label: 'מגדלים',
          title: 'ממוצע = ליישר מגדלים',
          interactive: 'meanTowers',
          paragraphs: ['דמייני כל נתון כמגדל קוביות. הממוצע הוא הגובה שכל המגדלים יקבלו אם נחלק את הקוביות שווה בשווה.', 'שחקי בהדמיה ולחצי "ליישר".'],
        },
        {
          label: 'סכום',
          title: 'הקשר בין ממוצע לסכום',
          paragraphs: ['ממוצע = סכום ÷ כמות.', 'ולהפך: **סכום = ממוצע × כמות**. זה המפתח לשאלות עם נתון חסר.'],
          example: { question: 'ממוצע 4 ציונים הוא 80. שלושה: 75, 90, 70. מה הרביעי?', steps: ['סכום: {{80 × 4 = 320}}', 'ידועים: {{75 + 90 + 70 = 235}}', 'רביעי: {{320 − 235 = 85}}'] },
        },
      ],
    },
    {
      id: 'statistics.median',
      title: 'חציון',
      addedIn: V,
      generate: median,
      explanations: [
        {
          label: 'תור',
          title: 'החציון = האמצעי בתור',
          paragraphs: ['מסדרים את כולם בתור לפי גובה. מי שבדיוק באמצע הוא החציון.', 'מספר זוגי של אנשים? יש שניים באמצע, והחציון הוא הממוצע שלהם.'],
          example: { question: '{{7, 2, 9, 4, 5}}', steps: ['מסודר: {{2, 4, 5, 7, 9}}', 'האמצעי: 5'] },
        },
        {
          label: 'מיליונר',
          title: 'חציון לא מתרגש מקיצוניים',
          paragraphs: ['משכורות: 8, 9, 10, 11, 12 (אלפים). ממוצע 10, חציון 10.', 'מחליפים את 12 במיליונר (1000): הממוצע קופץ ל-207.6, והחציון נשאר 10!', 'לכן כשיש ערכים קיצוניים, החציון מתאר את "הרגיל" טוב יותר.'],
        },
      ],
    },
  ],
};
