import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake } from '../helpers';
import { fmt } from '../../lib/answer';

const V = '0.4.0';
const PI = 3.14;
const r2 = (x: number) => Math.round(x * 100) / 100;
const PI_NOTE = `(השתמשי ב-${m('π ≈ 3.14')})`;

// ---------- volume.box ----------
function box(level: Level, rng: Rng): Exercise {
  const id = 'volume.box';
  if (level === 2) {
    const a = int(rng, 2, 10);
    const askEdge = rng() < 0.5;
    const vol = a ** 3;
    return {
      subtopicId: id,
      level,
      prompt: askEdge ? `נפח של קובייה הוא ${m(vol)} סמ"ק. מה אורך הצלע שלה?` : `מה הנפח של קובייה שאורך הצלע שלה ${m(a)} ס"מ?`,
      answer: { kind: 'number', value: askEdge ? a : vol, unit: askEdge ? 'ס"מ' : 'סמ"ק' },
      hints: [
        askEdge ? 'ידוע הנפח, ומחפשים את הצלע. בקובייה כל שלוש המידות שוות.' : 'קובייה היא תיבה שכל שלוש המידות שלה (אורך, רוחב, גובה) שוות.',
        askEdge ? 'נפח קובייה = צלע × צלע × צלע. מחפשים מספר שאם כופלים אותו בעצמו שלוש פעמים מקבלים את הנפח. אפשר לנסות מספרים.' : 'נפח = אורך × רוחב × גובה, וכאן שלושתם אותו מספר.',
        askEdge ? `נסי: ${m('5 × 5 × 5 = 125')}. צריך יותר או פחות?` : `${m(`${a} × ${a} × ${a}`)}`,
      ],
      solution: askEdge ? [`${m(`${a} × ${a} × ${a} = ${vol}`)}`, `הצלע: ${m(a)} ס"מ`] : [`${m(`${a} × ${a} × ${a} = ${vol}`)} סמ"ק`],
      mistakes: mistakes(isNum(askEdge ? a : vol), askEdge ? [numMistake(vol / 3, 'חילקת ב-3. מחפשים מספר שכפול עצמו שלוש פעמים נותן את הנפח.')] : [numMistake(3 * a, 'חיברת שלוש פעמים. נפח זה כפל: צלע × צלע × צלע.'), numMistake(a * a, 'זה שטח של פאה אחת. הנפח הוא צלע בחזקת 3.')]),
      visual: { type: 'box', length: askEdge ? '?' : String(a), width: askEdge ? '?' : String(a), height: askEdge ? '?' : String(a) },
    };
  }
  const [a, b, c] = [int(rng, 2, 12), int(rng, 2, 10), int(rng, 2, 9)];
  const vol = a * b * c;
  if (level === 1) {
    return {
      subtopicId: id,
      level,
      prompt: `מה הנפח של תיבה שמידותיה ${m(a)} ס"מ, ${m(b)} ס"מ ו-${m(c)} ס"מ?`,
      answer: { kind: 'number', value: vol, unit: 'סמ"ק' },
      hints: [
        'נפח = כמה קוביות קטנות של סנטימטר נכנסות בתוך התיבה.',
        'שכבה אחת על הרצפה מכילה אורך × רוחב קוביות. יש כמה שכבות כמו הגובה. לכן: אורך × רוחב × גובה.',
        `שכבה אחת: ${m(`${a} × ${b} = ${a * b}`)} קוביות. כמה שכבות?`,
      ],
      solution: [`${m(`${a} × ${b} × ${c} = ${vol}`)} סמ"ק`],
      mistakes: mistakes(isNum(vol), [numMistake(a + b + c, 'חיברת את המידות. נפח זה כפל של שלושתן.'), numMistake(a * b, 'זה רק שטח הבסיס (שכבה אחת). צריך לכפול גם בגובה.')]),
      visual: { type: 'box', length: String(a), width: String(b), height: String(c) },
    };
  }
  return {
    subtopicId: id,
    level,
    prompt: `נפח של תיבה הוא ${m(vol)} סמ"ק. האורך ${m(a)} ס"מ והרוחב ${m(b)} ס"מ. מה הגובה?`,
    answer: { kind: 'number', value: c, unit: 'ס"מ' },
    hints: [
      'ידוע הנפח ושתי מידות, וחסרה הגובה. הולכים אחורה.',
      'נפח = שטח הבסיס × גובה. מחשבים את שטח הבסיס, ובודקים כמה פעמים הוא נכנס בנפח. זה מספר השכבות, כלומר הגובה.',
      `שטח הבסיס: ${m(`${a} × ${b} = ${a * b}`)}. ${m(`${vol} ÷ ${a * b}`)} = ?`,
    ],
    solution: [`בסיס: ${m(a * b)}`, `${m(`${vol} ÷ ${a * b} = ${c}`)} ס"מ`],
    mistakes: mistakes(isNum(c), [numMistake(vol - a - b, 'החסרת במקום לחלק. הנפח הוא מכפלה, אז חוזרים בחילוק.')]),
    visual: { type: 'box', length: String(a), width: String(b), height: '?' },
  };
}

// ---------- volume.surface ----------
function surface(level: Level, rng: Rng): Exercise {
  const id = 'volume.surface';
  if (level === 1) {
    const a = int(rng, 2, 12);
    const ans = 6 * a * a;
    return {
      subtopicId: id,
      level,
      prompt: `מה שטח הפנים של קובייה שאורך צלעה ${m(a)} ס"מ?`,
      answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
      hints: [
        'שטח פנים = כמה נייר עטיפה צריך כדי לכסות את כל הקובייה מבחוץ.',
        'לקובייה יש 6 פאות, וכולן ריבועים זהים. מחשבים שטח של פאה אחת וכופלים ב-6.',
        `שטח פאה אחת: ${m(`${a} × ${a} = ${a * a}`)}. כמה פאות יש?`,
      ],
      solution: [`פאה: ${m(a * a)}`, `${m(`6 × ${a * a} = ${ans}`)} סמ"ר`],
      mistakes: mistakes(isNum(ans), [numMistake(a ** 3, 'זה הנפח. שטח הפנים הוא סכום השטחים של 6 הפאות.'), numMistake(4 * a * a, 'ספרת רק 4 פאות. לקובייה יש 6: גם למעלה וגם למטה.')]),
      visual: { type: 'box', length: String(a), width: String(a), height: String(a) },
    };
  }
  const [a, b, c] = [int(rng, 2, 10), int(rng, 2, 8), int(rng, 2, 9)];
  const full = 2 * (a * b + b * c + a * c);
  if (level === 2) {
    return {
      subtopicId: id,
      level,
      prompt: `מה שטח הפנים של תיבה שמידותיה: אורך ${m(a)}, רוחב ${m(b)}, גובה ${m(c)} (בס"מ)?`,
      answer: { kind: 'number', value: full, unit: 'סמ"ר' },
      hints: [
        'שטח פנים = סכום השטחים של כל הפאות של התיבה.',
        'לתיבה 6 פאות, שבאות בזוגות זהים: למטה ולמעלה, מקדימה ומאחורה, ימין ושמאל. מחשבים שלושה שטחים שונים וכל אחד כופלים ב-2.',
        `שלושת השטחים: ${m(`${a} × ${b}`)}, ${m(`${a} × ${c}`)}, ${m(`${b} × ${c}`)}.`,
      ],
      solution: [`${m(`${a * b} + ${a * c} + ${b * c} = ${a * b + a * c + b * c}`)}`, `${m(`× 2 = ${full}`)} סמ"ר`],
      mistakes: mistakes(isNum(full), [numMistake(a * b * c, 'זה הנפח. שטח פנים הוא סכום שטחי הפאות.'), numMistake(a * b + b * c + a * c, 'ספרת כל זוג פאות פעם אחת. יש 2 מכל סוג, אז כופלים ב-2.')]),
      visual: { type: 'box', length: String(a), width: String(b), height: String(c) },
    };
  }
  const ans = full - a * b;
  return {
    subtopicId: id,
    level,
    prompt: `בונים קופסה **בלי מכסה** בצורת תיבה: אורך ${m(a)}, רוחב ${m(b)}, גובה ${m(c)} (בס"מ). כמה סמ"ר קרטון צריך?`,
    answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
    hints: [
      'צריך את כל הפאות חוץ מאחת: אין מכסה למעלה.',
      'מחשבים שטח פנים מלא של תיבה, ומורידים את הפאה העליונה (אורך × רוחב).',
      `שטח פנים מלא: ${m(`2 × (${a * b} + ${a * c} + ${b * c})`)}`,
    ],
    solution: [`מלא: ${m(full)}`, `בלי מכסה: ${m(`${full} − ${a * b} = ${ans}`)} סמ"ר`],
    mistakes: mistakes(isNum(ans), [numMistake(full, 'זה שטח הפנים עם מכסה. צריך להוריד את הפאה העליונה.')]),
    visual: { type: 'box', length: String(a), width: String(b), height: String(c) },
  };
}

// ---------- volume.cylinder ----------
function cylinder(level: Level, rng: Rng): Exercise {
  const id = 'volume.cylinder';
  const r = int(rng, 1, 8);
  const h = int(rng, 2, 15);
  const vol = r2(PI * r * r * h);
  if (level === 1) {
    return {
      subtopicId: id,
      level,
      prompt: `מה הנפח של גליל עם רדיוס ${m(r)} ס"מ וגובה ${m(h)} ס"מ? ${PI_NOTE}`,
      answer: { kind: 'number', value: vol, unit: 'סמ"ק', tolerance: 0.011 },
      hints: [
        'גליל הוא כמו ערימה של מטבעות עגולים זהים.',
        'כמו בתיבה: נפח = שטח הבסיס × גובה. הבסיס הוא עיגול, ושטחו π × r².',
        `שטח הבסיס: ${m(`3.14 × ${r}² = ${fmt(r2(PI * r * r))}`)}. עכשיו כפול הגובה.`,
      ],
      solution: [`בסיס: ${m(fmt(r2(PI * r * r)))}`, `${m(`${fmt(r2(PI * r * r))} × ${h} = ${fmt(vol)}`)} סמ"ק`],
      mistakes: mistakes(isNum(vol), [numMistake(r2(2 * PI * r * h), 'השתמשת בהיקף הבסיס במקום בשטח שלו. הנפח: π × r² × h.'), numMistake(r2(PI * r * r), 'זה רק שטח הבסיס. צריך לכפול בגובה.')]),
      visual: { type: 'cylinder', r: `r = ${r}`, h: `h = ${h}` },
    };
  }
  if (level === 2) {
    return {
      subtopicId: id,
      level,
      prompt: `לפחית שתייה בצורת גליל יש קוטר ${m(2 * r)} ס"מ וגובה ${m(h)} ס"מ. מה הנפח שלה? ${PI_NOTE}`,
      answer: { kind: 'number', value: vol, unit: 'סמ"ק', tolerance: 0.011 },
      hints: [
        'נתון **קוטר**, והנוסחה צריכה **רדיוס**.',
        'הרדיוס הוא חצי מהקוטר. אחר כך: נפח = π × r² × גובה.',
        `רדיוס: ${m(`${2 * r} ÷ 2 = ${r}`)}`,
      ],
      solution: [`${m(`r = ${r}`)}`, `${m(`3.14 × ${r}² × ${h} = ${fmt(vol)}`)} סמ"ק`],
      mistakes: mistakes(isNum(vol), [numMistake(r2(PI * 4 * r * r * h), 'השתמשת בקוטר במקום ברדיוס. הרדיוס הוא חצי מהקוטר.')]),
      visual: { type: 'cylinder', r: `d = ${2 * r}`, h: `h = ${h}` },
    };
  }
  return {
    subtopicId: id,
    level,
    prompt: `נפח של גליל הוא ${m(fmt(vol))} סמ"ק והרדיוס שלו ${m(r)} ס"מ. מה הגובה? ${PI_NOTE}`,
    answer: { kind: 'number', value: h, unit: 'ס"מ', tolerance: 0.051 },
    hints: [
      'ידוע הנפח, וחסר הגובה. הולכים אחורה בנוסחה.',
      'נפח = שטח בסיס × גובה. מחשבים את שטח הבסיס (π × r²), ומחלקים בו את הנפח.',
      `שטח הבסיס: ${m(`3.14 × ${r}² = ${fmt(r2(PI * r * r))}`)}`,
    ],
    solution: [`בסיס: ${m(fmt(r2(PI * r * r)))}`, `${m(`${fmt(vol)} ÷ ${fmt(r2(PI * r * r))} = ${h}`)} ס"מ`],
    mistakes: [],
    visual: { type: 'cylinder', r: `r = ${r}`, h: 'h = ?' },
  };
}

// ---------- volume.units ----------
function units(level: Level, rng: Rng): Exercise {
  const id = 'volume.units';
  if (level === 1) {
    const toLiters = rng() < 0.5;
    const L = pick(rng, [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 0.25]);
    const cc = L * 1000;
    return {
      subtopicId: id,
      level,
      prompt: toLiters ? `כמה ליטרים הם ${m(cc)} סמ"ק?` : `כמה סמ"ק הם ${m(L)} ליטר?`,
      answer: { kind: 'number', value: toLiters ? L : cc, unit: toLiters ? 'ליטר' : 'סמ"ק' },
      hints: [
        'המרה בין יחידות נפח: ליטר וסנטימטר מעוקב (סמ"ק).',
        `ליטר אחד = ${m(1000)} סמ"ק (קובייה של 10 × 10 × 10 ס"מ). מליטרים לסמ"ק כופלים ב-1000, ומסמ"ק לליטרים מחלקים ב-1000.`,
        toLiters ? `${m(`${cc} ÷ 1000`)}` : `${m(`${L} × 1000`)}`,
      ],
      solution: [toLiters ? `${m(`${cc} ÷ 1000 = ${L}`)} ליטר` : `${m(`${L} × 1000 = ${cc}`)} סמ"ק`],
      mistakes: mistakes(isNum(toLiters ? L : cc), [numMistake(toLiters ? cc / 100 : L * 100, 'השתמשת ב-100. בליטר יש 1000 סמ"ק.')]),
    };
  }
  if (level === 2) {
    const [a, b, c] = [pick(rng, [20, 30, 40, 50, 60]), pick(rng, [20, 25, 30, 40]), pick(rng, [20, 30, 40, 50])];
    const L = (a * b * c) / 1000;
    return {
      subtopicId: id,
      level,
      prompt: `כמה ליטר מים נכנסים באקווריום בצורת תיבה: ${m(a)} × ${m(b)} × ${m(c)} ס"מ?`,
      answer: { kind: 'number', value: L, unit: 'ליטר' },
      hints: [
        'שתי פעולות: חישוב נפח, ואחר כך המרה לליטרים.',
        'קודם הנפח בסמ"ק (אורך × רוחב × גובה), ואחר כך מחלקים ב-1000 כי ליטר = 1000 סמ"ק.',
        `${m(`${a} × ${b} × ${c}`)} = ?`,
      ],
      solution: [`${m(`${a} × ${b} × ${c} = ${a * b * c}`)} סמ"ק`, `${m(`${a * b * c} ÷ 1000 = ${fmt(L)}`)} ליטר`],
      mistakes: mistakes(isNum(L), [numMistake(a * b * c, 'זה הנפח בסמ"ק. צריך להמיר לליטרים: לחלק ב-1000.')]),
      visual: { type: 'box', length: String(a), width: String(b), height: String(c) },
    };
  }
  const [a, b, c] = [pick(rng, [1, 2, 3]), pick(rng, [0.5, 1, 2]), pick(rng, [0.5, 1, 1.5])];
  const L = a * b * c * 1000;
  return {
    subtopicId: id,
    level,
    prompt: `בריכה קטנה בצורת תיבה: ${m(a)} מ' × ${m(b)} מ' × ${m(c)} מ'. כמה ליטר מים נכנסים בה?`,
    answer: { kind: 'number', value: L, unit: 'ליטר' },
    hints: [
      'המידות במטרים, והתשובה בליטרים.',
      'מטר מעוקב (קובייה של 1 × 1 × 1 מטר) מכיל 1000 ליטר. מחשבים את הנפח במ"ק, וכופלים ב-1000.',
      `הנפח: ${m(`${a} × ${b} × ${c}`)} מ"ק.`,
    ],
    solution: [`${m(`${a} × ${b} × ${c} = ${fmt(a * b * c)}`)} מ"ק`, `${m(`${fmt(a * b * c)} × 1000 = ${fmt(L)}`)} ליטר`],
    mistakes: mistakes(isNum(L), [numMistake(a * b * c, 'זה הנפח במ"ק. כל מ"ק הוא 1000 ליטר.')]),
  };
}

// ---------- volume.compare ----------
function compare(level: Level, rng: Rng): Exercise {
  const id = 'volume.compare';
  const options = ['המיכל הראשון', 'המיכל השני', 'הנפחים שווים'];
  let v1: number, v2: number, d1: string, d2: string;
  if (level === 1) {
    const [a, b, c] = [int(rng, 2, 8), int(rng, 2, 8), int(rng, 2, 8)];
    const [x, y, z] = [int(rng, 2, 8), int(rng, 2, 8), int(rng, 2, 8)];
    v1 = a * b * c;
    v2 = x * y * z;
    d1 = `תיבה ${m(`${a} × ${b} × ${c}`)}`;
    d2 = `תיבה ${m(`${x} × ${y} × ${z}`)}`;
  } else if (level === 2) {
    const s = int(rng, 3, 7);
    const [a, b] = [int(rng, 2, 9), int(rng, 2, 9)];
    const c = Math.max(1, Math.round((s ** 3 + int(rng, -20, 20)) / (a * b)));
    v1 = s ** 3;
    v2 = a * b * c;
    d1 = `קובייה עם צלע ${m(s)}`;
    d2 = `תיבה ${m(`${a} × ${b} × ${c}`)}`;
  } else {
    const r = int(rng, 2, 5);
    const h = int(rng, 3, 10);
    v1 = r2(PI * r * r * h);
    const side = 2 * r;
    v2 = side * side * h;
    const swap = rng() < 0.5;
    d1 = swap ? `תיבה ${m(`${side} × ${side} × ${h}`)}` : `גליל עם רדיוס ${m(r)} וגובה ${m(h)}`;
    d2 = swap ? `גליל עם רדיוס ${m(r)} וגובה ${m(h)}` : `תיבה ${m(`${side} × ${side} × ${h}`)}`;
    if (swap) [v1, v2] = [v2, v1];
  }
  const correct = Math.abs(v1 - v2) < 1e-9 ? 2 : v1 > v2 ? 0 : 1;
  return {
    subtopicId: id,
    level,
    prompt: `איזה מיכל מכיל יותר? המיכל הראשון: ${d1}. המיכל השני: ${d2}. (המידות בס"מ${level === 3 ? `, ${m('π ≈ 3.14')}` : ''})`,
    answer: { kind: 'choice', options, correct },
    hints: [
      'משווים נפחים. מיכל גבוה או רחב יותר לא בהכרח מכיל יותר.',
      'מחשבים את הנפח של כל מיכל בנפרד (כל אחד לפי הנוסחה שלו), ומשווים את המספרים.' + (level === 3 ? ' רמז ויזואלי: גליל שנכנס בדיוק בתוך תיבה תמיד קטן ממנה.' : ''),
      `נפח המיכל הראשון: ${level === 3 ? 'לפי הנוסחה שלו' : 'כפלי את שלוש המידות'}.`,
    ],
    solution: [`ראשון: ${m(fmt(v1))} סמ"ק, שני: ${m(fmt(v2))} סמ"ק.`, correct === 2 ? 'שווים.' : correct === 0 ? 'הראשון מכיל יותר.' : 'השני מכיל יותר.'],
    mistakes: [],
  };
}

export const volumeUnit: UnitContent = {
  hook: {
    title: 'ערימת מטבעות',
    text: 'ערימה של 10 מטבעות זהים היא בעצם גליל. הנפח שלה הוא השטח של מטבע אחד, כפול הגובה של הערימה. אותו רעיון עובד לתיבה, לקובייה ולכל מנסרה: שטח הבסיס × גובה. נוסחה אחת לכולם.',
  },
  tricks: ['נפח = שטח בסיס × גובה (תיבה, קובייה, גליל).', 'נפח בסמ"ק, שטח פנים בסמ"ר.', 'ליטר = 1000 סמ"ק. מ"ק = 1000 ליטר.', 'קוטר? חלקי ב-2 לרדיוס.'],
  commonMistakes: [
    { title: 'לבלבל נפח ושטח פנים', text: 'נפח = כמה נכנס בפנים. שטח פנים = כמה נייר עוטף מבחוץ.' },
    { title: 'לשכוח פאות', text: 'לתיבה 6 פאות, בזוגות. אם אין מכסה, יש 5.' },
    { title: 'ליטר', text: '{{2000}} סמ"ק = 2 ליטר, לא 20.' },
  ],
  subtopics: [
    {
      id: 'volume.box',
      title: 'תיבה וקובייה: נפח',
      addedIn: V,
      generate: box,
      explanations: [
        {
          label: 'שכבות',
          title: 'נפח = שכבות של קוביות',
          interactive: 'boxLayers',
          paragraphs: ['בכל שכבה יש אורך × רוחב קוביות. מספר השכבות הוא הגובה.', 'לכן נפח = אורך × רוחב × גובה.', 'שחקי בהדמיה: הוסיפי שכבות וראי איך הנפח גדל.'],
        },
        {
          label: 'קובייה',
          title: 'קובייה',
          paragraphs: ['בקובייה כל המידות שוות: נפח = צלע³.', 'כדאי להכיר: {{2³ = 8}}, {{3³ = 27}}, {{4³ = 64}}, {{5³ = 125}}, {{10³ = 1000}}.'],
        },
      ],
    },
    {
      id: 'volume.surface',
      title: 'שטח פנים',
      addedIn: V,
      generate: surface,
      explanations: [
        {
          label: 'עטיפה',
          title: 'שטח פנים = נייר עטיפה',
          paragraphs: ['כמה נייר צריך כדי לעטוף מתנה בצורת תיבה? מחברים את שטחי כל 6 הפאות.', 'הפאות באות בזוגות: למטה ולמעלה, מקדימה ומאחורה, ימין ושמאל.', '{{2 × (ab + ac + bc)}}'],
        },
        {
          label: 'פריסה',
          title: 'פריסה',
          paragraphs: ['אם פותחים קופסה ומשטחים אותה, מקבלים "פריסה": 6 מלבנים מחוברים.', 'שטח הפריסה = שטח הפנים.'],
        },
      ],
    },
    {
      id: 'volume.cylinder',
      title: 'הגליל',
      addedIn: V,
      generate: cylinder,
      explanations: [
        {
          label: 'מטבעות',
          title: 'גליל = ערימת עיגולים',
          paragraphs: ['הבסיס הוא עיגול: שטחו {{π × r²}}.', 'נפח = שטח הבסיס × גובה = {{π × r² × h}}.'],
          example: { question: 'r = 3, h = 10', steps: ['בסיס: {{3.14 × 9 = 28.26}}', 'נפח: {{28.26 × 10 = 282.6}} סמ"ק'] },
        },
        {
          label: 'פריסה',
          title: 'פריסה של גליל',
          paragraphs: ['פותחים פחית: מקבלים שני עיגולים (למעלה ולמטה) ומלבן אחד.', 'אורך המלבן שווה להיקף העיגול ({{2πr}}), והרוחב שלו הוא הגובה.'],
        },
      ],
    },
    {
      id: 'volume.units',
      title: 'יחידות נפח: סמ"ק וליטר',
      addedIn: V,
      generate: units,
      explanations: [
        {
          label: 'ליטר',
          title: 'מה זה ליטר?',
          paragraphs: ['ליטר הוא בדיוק קובייה של 10 × 10 × 10 ס"מ, כלומר {{1000}} סמ"ק.', 'בקבוק של 1.5 ליטר = 1500 סמ"ק.'],
        },
        {
          label: 'מ"ק',
          title: 'מטר מעוקב',
          paragraphs: ['מטר מעוקב = 100 × 100 × 100 ס"מ = מיליון סמ"ק = 1000 ליטר.', 'אמבטיה מלאה היא בערך 0.2 מ"ק = 200 ליטר.'],
        },
      ],
    },
    {
      id: 'volume.compare',
      title: 'איזה נפח גדול יותר?',
      addedIn: V,
      generate: compare,
      explanations: [
        {
          label: 'מראה מטעה',
          title: 'העין מטעה',
          paragraphs: ['כוס גבוהה וצרה נראית מכילה יותר מכוס רחבה ונמוכה, אבל לא תמיד זה נכון.', 'היחיד שיודע הוא החישוב: מחשבים נפח לכל אחד ומשווים.'],
        },
        {
          label: 'גליל בתיבה',
          title: 'גליל בתוך תיבה',
          paragraphs: ['גליל שנכנס בדיוק בתיבה (הקוטר שווה לצלע הבסיס) תופס בערך 78.5% ממנה.', 'כי {{π ÷ 4 ≈ 0.785}}.'],
        },
      ],
    },
  ],
};
