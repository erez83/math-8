import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, shuffle, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake } from '../helpers';

const V = '0.3.0';

/** Multiple choice with the right answer and distinct wrong answers. */
function choice(rng: Rng, right: string, wrongs: string[]) {
  const options = shuffle(rng, Array.from(new Set([right, ...wrongs])));
  return { kind: 'choice' as const, options, correct: options.indexOf(right) };
}

// ---------- estimation.percent ----------
const FRIENDLY = [
  { near: [9, 11], exact: 10, frac: 'עשירית', div: 10 },
  { near: [24, 26], exact: 25, frac: 'רבע', div: 4 },
  { near: [49, 51, 48, 52], exact: 50, frac: 'חצי', div: 2 },
  { near: [19, 21], exact: 20, frac: 'חמישית', div: 5 },
  { near: [33, 34], exact: 33, frac: 'שליש', div: 3 },
];

function estPercent(level: Level, rng: Rng): Exercise {
  const id = 'estimation.percent';
  const f = pick(rng, level === 1 ? FRIENDLY.slice(0, 4) : FRIENDLY);
  const p = level === 1 ? f.exact : pick(rng, f.near);
  const base = f.div * int(rng, 3, 30) * (level === 3 ? 10 : 1);
  const N = level === 1 ? base : base + pick(rng, [-2, -1, 1, 2]) * (level === 3 ? 1 : 1);
  const est = Math.round(N / f.div);
  const ctxN = level === 3 ? `מחיר מכשיר הוא ${m(N)} ש"ח, ויש עליו הנחה של ${m(p + '%')}. בערך כמה כסף חוסכים?` : `בערך כמה זה ${m(p + '%')} מ-${m(N)}?`;
  const right = `בערך ${est}`;
  const wrongs = [`בערך ${est * 10}`, `בערך ${Math.max(1, Math.round(est / 10))}`, `בערך ${N - est}`, `בערך ${est * 2}`].filter((w) => w !== right);
  return {
    subtopicId: id,
    level,
    prompt: ctxN,
    answer: choice(rng, right, wrongs.slice(0, 3)),
    hints: [
      'לא צריך חישוב מדויק, רק לדעת בערך. מחפשים דרך מהירה בראש.',
      `${m(p + '%')} קרוב לאחוז "נוח": ${m(f.exact + '%')}, שזה ${f.frac}. במקום לחשב אחוזים, לוקחים ${f.frac} מהמספר.`,
      `${f.frac} מ-${m(N)} זה בערך ${m(`${N} ÷ ${f.div}`)}`,
    ],
    solution: [`${m(p + '%')} ≈ ${m(f.exact + '%')} = ${f.frac}.`, `${m(`${N} ÷ ${f.div} ≈ ${est}`)}`],
    mistakes: [],
  };
}

// ---------- estimation.rounding ----------
function rounding(level: Level, rng: Rng): Exercise {
  const id = 'estimation.rounding';
  if (level === 1) {
    const to = pick(rng, [10, 100, 1000]);
    const n = int(rng, to + 1, to * 99);
    if (n % to === 0) return rounding(level, rng);
    const ans = Math.round(n / to) * to;
    const name = to === 10 ? 'עשרות' : to === 100 ? 'מאות' : 'אלפים';
    const digitName = to === 10 ? 'האחדות' : to === 100 ? 'העשרות' : 'המאות';
    return {
      subtopicId: id,
      level,
      prompt: `עגלי את המספר ${m(n)} ל${name} הקרובות.`,
      answer: { kind: 'number', value: ans },
      hints: [
        `מחפשים את המספר העגול (שמסתיים ב-${String(to).slice(1)}) הכי קרוב ל-${m(n)}.`,
        `מסתכלים על ספרת ${digitName}, הספרה שמימין למקום שאליו מעגלים. אם היא 5 ומעלה מעגלים למעלה, ואם 4 ומטה מעגלים למטה.`,
        `שני המספרים העגולים הקרובים: ${m(Math.floor(n / to) * to)} ו-${m(Math.ceil(n / to) * to)}. איזה קרוב יותר?`,
      ],
      solution: [`${m(n)} בין ${m(Math.floor(n / to) * to)} ל-${m(Math.ceil(n / to) * to)}.`, `הקרוב יותר: ${m(ans)}.`],
      mistakes: mistakes(isNum(ans), [numMistake(Math.floor(n / to) * to, 'עיגלת למטה, אבל הספרה הקובעת היא 5 או יותר, ולכן מעגלים למעלה.'), numMistake(Math.ceil(n / to) * to, 'עיגלת למעלה, אבל הספרה הקובעת קטנה מ-5, ולכן מעגלים למטה.')]),
    };
  }
  if (level === 2) {
    const a = int(rng, 2, 9) * 100 + pick(rng, [-3, -2, -1, 1, 2, 3]);
    const b = int(rng, 2, 9) * 10 + pick(rng, [-1, 1, 2]);
    const ea = Math.round(a / 100) * 100;
    const eb = Math.round(b / 10) * 10;
    const est = ea * eb;
    return {
      subtopicId: id,
      level,
      prompt: `איזה אומדן הכי קרוב לתוצאה של ${m(`${a} × ${b}`)}?`,
      answer: choice(rng, String(est), [String(est * 10), String(est / 10), String(ea + eb)]),
      hints: [
        'לא מחשבים בדיוק. מחפשים בערך, בעזרת מספרים עגולים.',
        'מעגלים כל מספר למספר עגול קרוב (כמו מאות או עשרות), ואז הכפל קל בראש. שימי לב לכמות האפסים.',
        `${m(a)} ≈ ${m(ea)}, ${m(b)} ≈ ${m(eb)}`,
      ],
      solution: [`${m(`${ea} × ${eb} = ${est}`)}`, `התוצאה המדויקת (${m(a * b)}) קרובה לזה.`],
      mistakes: [],
    };
  }
  const q = int(rng, 2, 9) * 100;
  const d = int(rng, 2, 9) * 10;
  const n = q * d + pick(rng, [-37, 23, 41, -12]);
  const dd = d + pick(rng, [-1, 1]);
  const est = Math.round(n / d / 10) * 10;
  return {
    subtopicId: id,
    level,
    prompt: `איזה אומדן הכי קרוב לתוצאה של ${m(`${n} ÷ ${dd}`)}?`,
    answer: choice(rng, String(est), [String(est * 10), String(Math.round(est / 10)), String(est * 100)]),
    hints: [
      'אומדן של חילוק. בוחרים מספרים עגולים שמתחלקים יפה זה בזה.',
      'מעגלים את המחלק למספר עגול, ואת המחולק למספר שמתחלק בו בקלות. אחר כך מחלקים בראש.',
      `${m(dd)} ≈ ${m(d)}. ${m(n)} ≈ ${m(q * d)}.`,
    ],
    solution: [`${m(`${q * d} ÷ ${d} = ${q}`)}`, `לכן התוצאה בערך ${m(q)}.`],
    mistakes: [],
  };
}

// ---------- estimation.reasonable ----------
function reasonable(level: Level, rng: Rng): Exercise {
  const id = 'estimation.reasonable';
  const kind = pick(rng, ['ok', 'big', 'small'] as const);
  const opts = ['כן, התוצאה סבירה', 'לא, היא גדולה מדי (פי 10 בערך)', 'לא, היא קטנה מדי (פי 10 בערך)'];
  let calc: string;
  let exact: number;
  let roughText: string;
  if (level === 1) {
    const a = int(rng, 11, 49);
    const b = int(rng, 11, 29);
    exact = a * b;
    roughText = `${m(`${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${Math.round(a / 10) * 10 * Math.round(b / 10) * 10}`)}`;
    calc = `${a} × ${b}`;
  } else if (level === 2) {
    const a = int(rng, 21, 99) / 10;
    const b = int(rng, 21, 99) / 10;
    exact = Math.round(a * b * 100) / 100;
    roughText = `${m(`${Math.round(a)} × ${Math.round(b)} = ${Math.round(a) * Math.round(b)}`)}`;
    calc = `${a} × ${b}`;
  } else {
    const p = pick(rng, [10, 20, 25, 50]);
    const N = int(rng, 3, 40) * 20;
    exact = (p * N) / 100;
    roughText = `${m(p + '%')} מ-${m(N)} זה בערך ${p === 50 ? 'חצי' : p === 25 ? 'רבע' : p === 20 ? 'חמישית' : 'עשירית'}: ${m(exact)}`;
    calc = `${p}% מ-${N}`;
  }
  const shown = kind === 'ok' ? exact : kind === 'big' ? exact * 10 : exact / 10;
  const shownStr = String(Math.round(shown * 1000) / 1000);
  const correct = kind === 'ok' ? 0 : kind === 'big' ? 1 : 2;
  const who = pick(rng, ['שירה', 'נועה', 'טל', 'מאיה']);
  return {
    subtopicId: id,
    level,
    prompt: `${who} חישבה ${m(calc)} וקיבלה ${m(shownStr)}. האם התוצאה סבירה?`,
    answer: { kind: 'choice', options: opts, correct },
    hints: [
      'לא צריך לחשב בדיוק. רק לבדוק אם התוצאה "בגודל הנכון".',
      'עושים אומדן מהיר עם מספרים עגולים, ומשווים: אם התוצאה של החישוב רחוקה מאוד מהאומדן (פי 10 ויותר), כנראה יש טעות, בדרך כלל בנקודה העשרונית או במספר האפסים.',
      `האומדן: ${roughText}`,
    ],
    solution: [`אומדן: ${roughText}.`, kind === 'ok' ? 'התוצאה קרובה לאומדן, אז היא סבירה.' : kind === 'big' ? 'התוצאה גדולה פי 10 בערך מהאומדן. כנראה טעות בנקודה או באפסים.' : 'התוצאה קטנה פי 10 בערך מהאומדן. כנראה טעות בנקודה או באפסים.'],
    mistakes: [],
  };
}

export const estimationUnit: UnitContent = {
  hook: {
    title: 'מבחן הסבירות',
    text: 'בקופה בסופר הקופאית אומרת "523 ש"ח" על 4 מוצרים קטנים. משהו מרגיש לא בסדר, נכון? זה אומדן: היכולת לדעת בערך מה התשובה, בלי לחשב. זה עוזר לתפוס טעויות לפני שהן קורות, גם במבחן.',
  },
  tricks: ['עגלי, חשבי, השווי.', '10%, 25%, 50% = עשירית, רבע, חצי. קל בראש.', 'תוצאה רחוקה פי 10 מהאומדן? בדקי את הנקודה העשרונית ואת האפסים.'],
  commonMistakes: [
    { title: 'לספור אפסים לא נכון', text: '{{400 × 30}} זה {{12000}}: {{4 × 3 = 12}}, ועוד שלושה אפסים.' },
    { title: 'לעגל לכיוון הלא נכון', text: '{{3,450}} למאות זה {{3,500}}: ספרת העשרות היא 5, ולכן מעגלים למעלה.' },
    { title: 'לוותר על בדיקה', text: 'אחרי כל חישוב, שאלי: "האם זה הגיוני?" זה לוקח 3 שניות.' },
  ],
  subtopics: [
    {
      id: 'estimation.percent',
      title: 'אחוזים: אומדנים',
      addedIn: V,
      generate: estPercent,
      explanations: [
        {
          label: 'אחוזים נוחים',
          title: 'אחוזים שקל לחשב בראש',
          interactive: 'percentGrid',
          paragraphs: ['10% = עשירית (מחלקים ב-10).', '25% = רבע (מחלקים ב-4).', '50% = חצי (מחלקים ב-2).', '49% או 51%? בערך חצי. 24%? בערך רבע.'],
        },
        {
          label: 'בחנות',
          title: 'בחנות',
          paragraphs: ['"הנחה של 24% על 398 ש"ח". כמה חוסכים?', '24% ≈ רבע, 398 ≈ 400, רבע מ-400 = 100.', 'חוסכים בערך 100 ש"ח, ואפשר להחליט אם זה משתלם.'],
        },
      ],
    },
    {
      id: 'estimation.rounding',
      title: 'עיגול ואומדן תוצאת חישוב',
      addedIn: V,
      generate: rounding,
      explanations: [
        {
          label: 'עיגול',
          title: 'איך מעגלים',
          paragraphs: ['מעגלים למקום מסוים (עשרות, מאות...), ומסתכלים על הספרה **שמימין** לו.', '5 ומעלה: מעגלים למעלה. 4 ומטה: מעגלים למטה.'],
          example: { question: 'עגלי את 3,847 למאות', steps: ['ספרת המאות: 8', 'הספרה מימין לה: 4', 'מעגלים למטה: 3,800'] },
        },
        {
          label: 'אומדן',
          title: 'אומדן של חישוב',
          paragraphs: ['מעגלים כל מספר לספרה משמעותית אחת, ומחשבים בראש.', '{{398 × 21}} ≈ {{400 × 20 = 8000}}.', 'התוצאה המדויקת ({{8358}}) קרובה מאוד.'],
        },
      ],
    },
    {
      id: 'estimation.reasonable',
      title: 'בדיקת סבירות של תשובה',
      addedIn: V,
      generate: reasonable,
      explanations: [
        {
          label: 'בדיקה',
          title: 'שלושה צעדים לבדיקה',
          paragraphs: ['1. עגלי את המספרים.', '2. חשבי בראש.', '3. השווי לתוצאה. אם היא רחוקה פי 10 או יותר, יש טעות.'],
        },
        {
          label: 'עשרוניים',
          title: 'נקודה עשרונית שברחה',
          paragraphs: ['{{4.8 × 5.1}}: אומדן {{5 × 5 = 25}}.', 'אם יצא {{244.8}}, הנקודה ברחה מקום אחד.', 'אומדן הוא הדרך הכי מהירה לתפוס את זה.'],
        },
      ],
    },
  ],
};
