import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, coprimeTuple, shuffle, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake } from '../helpers';

const V = '0.3.0';

/** Two different scale factors, the second not a multiple of the first (so cross-multiplying is needed). */
function twoScales(rng: Rng): [number, number] {
  for (;;) {
    const s1 = int(rng, 2, 6);
    const s2 = int(rng, 2, 9);
    if (s1 !== s2 && s2 % s1 !== 0 && s1 % s2 !== 0) return [s1, s2];
  }
}

// ---------- proportion.check ----------
function check(level: Level, rng: Rng): Exercise {
  const id = 'proportion.check';
  const [p, q] = coprimeTuple(rng, 2, 1, 9);
  if (level === 3) {
    const [s1, s2] = twoScales(rng);
    const [a, b, c, d] = [p * s1, q * s1, p * s2, q * s2];
    const right = `{{${a}:${b} = ${c}:${d}}}`;
    const wrongs = [`{{${a}:${b} = ${c}:${d + 1}}}`, `{{${a}:${b} = ${d}:${c}}}`, `{{${a}:${b} = ${c + 1}:${d + 1}}}`];
    const options = shuffle(rng, [right, ...wrongs]);
    return {
      subtopicId: id,
      level,
      prompt: 'איזה מהשוויונות הוא פרופורציה נכונה?',
      answer: { kind: 'choice', options, correct: options.indexOf(right) },
      hints: [
        'פרופורציה היא שוויון בין שני יחסים. מחפשים את השוויון שבו שני היחסים באמת שווים.',
        'כשהמספרים לא כפולה פשוטה זה של זה, משתמשים בכפל בהצלבה: בפרופורציה נכונה, מכפלת הקצוות שווה למכפלת האמצעיים.',
        `בדקי בכל תשובה: ${m(`${a} × ?`)} לעומת ${m(`${b} × ?`)}. מכפילים את הראשון ברביעי ואת השני בשלישי.`,
      ],
      solution: [`${m(`${a} × ${d} = ${a * d}`)} ו-${m(`${b} × ${c} = ${b * c}`)}: המכפלות שוות.`, `לכן ${right} היא פרופורציה.`],
      mistakes: [],
    };
  }
  const isTrue = rng() < 0.5;
  let a: number, b: number, c: number, d: number;
  if (level === 1) {
    const k = int(rng, 2, 6);
    [a, b, c, d] = [p, q, p * k, q * k];
  } else {
    const [s1, s2] = twoScales(rng);
    [a, b, c, d] = [p * s1, q * s1, p * s2, q * s2];
  }
  if (!isTrue) d += pick(rng, [1, -1, 2]);
  if (d <= 0) d = q + 1;
  const holds = a * d === b * c;
  return {
    subtopicId: id,
    level,
    prompt: `האם ${m(`${a}:${b} = ${c}:${d}`)} היא פרופורציה?`,
    answer: { kind: 'choice', options: ['כן, היחסים שווים', 'לא, היחסים שונים'], correct: holds ? 0 : 1 },
    hints: [
      'פרופורציה = שני יחסים ששווים זה לזה. צריך לבדוק אם היחסים כאן באמת שווים.',
      level === 1
        ? 'בודקים פי כמה גדל המספר הראשון. אם גם המספר השני גדל פי אותו מספר בדיוק, היחסים שווים.'
        : 'כאן קשה לראות "פי כמה". משתמשים בכפל בהצלבה: אם מכפלת הקצוות שווה למכפלת האמצעיים, זו פרופורציה.',
      level === 1 ? `פי כמה ${m(a)} הפך ל-${m(c)}? ומה קרה ל-${m(b)}?` : `חשבי ${m(`${a} × ${d}`)} וגם ${m(`${b} × ${c}`)}, והשווי.`,
    ],
    solution: [
      `${m(`${a} × ${d} = ${a * d}`)}, ${m(`${b} × ${c} = ${b * c}`)}.`,
      holds ? 'המכפלות שוות, לכן זו פרופורציה.' : 'המכפלות שונות, לכן זו לא פרופורציה.',
    ],
    mistakes: [],
  };
}

// ---------- proportion.missing ----------
function missing(level: Level, rng: Rng): Exercise {
  const id = 'proportion.missing';
  const [p, q] = coprimeTuple(rng, 2, 1, 9);
  if (level === 1) {
    const k = int(rng, 2, 9);
    const ans = q * k;
    return {
      subtopicId: id,
      level,
      prompt: `מצאי את x: ${m(`${p}:${q} = ${p * k}:x`)}`,
      answer: { kind: 'number', value: ans },
      hints: [
        'זו פרופורציה: שני היחסים שווים, ו-x הוא המספר שחסר כדי שהשוויון יתקיים.',
        'מחפשים פי כמה גדל המספר שמול x בצד השני. את x מקבלים מהגדלה של המספר המתאים פי אותו מספר.',
        `פי כמה ${m(p)} הפך ל-${m(p * k)}?`,
      ],
      solution: [`${m(`${p * k} ÷ ${p} = ${k}`)}: גדל פי ${m(k)}.`, `${m(`x = ${q} × ${k} = ${ans}`)}`],
      mistakes: mistakes(isNum(ans), [numMistake(q + (p * k - p), 'הוספת את אותו הפרש. בפרופורציה מכפילים, לא מוסיפים.')]),
    };
  }
  const [s1, s2] = twoScales(rng);
  const [a, b, c, d] = [p * s1, q * s1, p * s2, q * s2];
  if (level === 2) {
    // x in a random position
    const pos = int(rng, 0, 3);
    const vals = [a, b, c, d];
    const ans = vals[pos];
    const shown = vals.map((v, i) => (i === pos ? 'x' : String(v)));
    const known = [0, 1, 2, 3].filter((i) => i !== pos);
    // The "partner" of x across the equality: pos 0↔3 and 1↔2 are multiplied together.
    const partner = 3 - pos;
    const others = known.filter((i) => i !== partner);
    return {
      subtopicId: id,
      level,
      prompt: `מצאי את x: ${m(`${shown[0]}:${shown[1]} = ${shown[2]}:${shown[3]}`)}`,
      answer: { kind: 'number', value: ans },
      hints: [
        'פרופורציה עם מספר חסר. כאן אין "פי כמה" פשוט, אז צריך דרך אחרת.',
        'כפל בהצלבה: בפרופורציה, מכפלת הקצוות (הראשון × הרביעי) שווה למכפלת האמצעיים (השני × השלישי). כותבים משוואה ופותרים.',
        `כתבי: ${m(`x × ${vals[partner]} = ${vals[others[0]]} × ${vals[others[1]]}`)}`,
      ],
      solution: [
        `כפל בהצלבה: ${m(`x × ${vals[partner]} = ${vals[others[0]]} × ${vals[others[1]]} = ${vals[others[0]] * vals[others[1]]}`)}.`,
        `${m(`x = ${vals[others[0]] * vals[others[1]]} ÷ ${vals[partner]} = ${ans}`)}`,
      ],
      mistakes: [],
    };
  }
  // level 3: fraction form, x in the denominator
  const ans = b;
  return {
    subtopicId: id,
    level,
    prompt: `מצאי את x: ${m(`${a}/x = ${c}/${d}`)}`,
    answer: { kind: 'number', value: ans },
    hints: [
      'שני שברים שווים זה פרופורציה. x נמצא במכנה.',
      'כפל בהצלבה עובד גם בשברים: המונה של אחד כפול המכנה של השני. אחר כך מבודדים את x.',
      `כתבי: ${m(`${c} × x = ${a} × ${d}`)}`,
    ],
    solution: [`${m(`${c} × x = ${a} × ${d} = ${a * d}`)}`, `${m(`x = ${a * d} ÷ ${c} = ${ans}`)}`],
    mistakes: mistakes(isNum(ans), [numMistake((c * d) / a, 'כפלת את המספרים הלא נכונים. בכפל בהצלבה כופלים באלכסון: מונה של שבר אחד כפול המכנה של השני.')]),
  };
}

// ---------- proportion.direct ----------
const ITEMS = [
  { one: 'מחברות', unit: 'ש"ח', verb: 'עולות' },
  { one: 'כרטיסים לסרט', unit: 'ש"ח', verb: 'עולים' },
  { one: 'בקבוקי מים', unit: 'ש"ח', verb: 'עולים' },
];

function direct(level: Level, rng: Rng): Exercise {
  const id = 'proportion.direct';
  if (level === 1) {
    const it = pick(rng, ITEMS);
    const u = int(rng, 2, 15);
    const n = int(rng, 2, 6);
    let mm = int(rng, 2, 12);
    if (mm === n) mm++;
    const P = n * u;
    const ans = mm * u;
    return {
      subtopicId: id,
      level,
      prompt: `${m(n)} ${it.one} ${it.verb} ${m(P)} ${it.unit}. כמה ${it.verb} ${m(mm)} ${it.one}?`,
      answer: { kind: 'number', value: ans, unit: it.unit },
      hints: [
        `המחיר תלוי בכמות: יותר ${it.one}, יותר כסף, ובאותו קצב. זה יחס ישר.`,
        'דרך נוחה: מוצאים כמה עולה **אחד**, ואז כופלים בכמות החדשה.',
        `כמה עולה אחד? ${m(`${P} ÷ ${n}`)}`,
      ],
      solution: [`אחד: ${m(`${P} ÷ ${n} = ${u}`)}.`, `${m(mm)}: ${m(`${mm} × ${u} = ${ans}`)} ${it.unit}.`],
      mistakes: mistakes(isNum(ans), [
        numMistake(P + (mm - n), 'הוספת את ההפרש בכמות למחיר. צריך קודם לדעת כמה עולה אחד.'),
        numMistake(u, `${m(u)} זה המחיר של אחד בלבד. השאלה היא על ${m(mm)}.`),
      ]),
    };
  }
  const [p, q] = coprimeTuple(rng, 2, 2, 9);
  const [s1, s2] = twoScales(rng);
  if (level === 2) {
    const ctx = pick(rng, [
      { a: 'ליטר דלק', b: 'ק"מ', make: (x: number, y: number) => `מכונית נוסעת ${m(y)} ק"מ עם ${m(x)} ליטר דלק. כמה ק"מ תיסע עם ` },
      { a: 'דקות', b: 'ליטר', make: (x: number, y: number) => `ברז ממלא ${m(y)} ליטר ב-${m(x)} דקות. כמה ליטר ימלא ב-` },
    ]);
    const n = p * s1;
    const P = q * s1 * 5;
    const mm = p * s2;
    const ans = q * s2 * 5;
    return {
      subtopicId: id,
      level,
      prompt: `${ctx.make(n, P)}${m(mm)} ${ctx.a}?`,
      answer: { kind: 'number', value: ans, unit: ctx.b },
      hints: [
        'שני גדלים שגדלים יחד באותו קצב: זה יחס ישר, ואפשר לכתוב פרופורציה.',
        'סדרי בטבלה קטנה: שורה אחת לנתון הידוע ושורה למבוקש. פי כמה השתנתה הכמות? אם זה לא מספר שלם, אפשר למצוא קודם את הערך ליחידה אחת, או לכתוב פרופורציה ולפתור בכפל בהצלבה.',
        `כתבי: ${m(`${n}:${P} = ${mm}:x`)}`,
      ],
      solution: [`${m(`${n}:${P} = ${mm}:x`)}`, `${m(`${n} × x = ${P} × ${mm} = ${P * mm}`)}`, `${m(`x = ${P * mm} ÷ ${n} = ${ans}`)} ${ctx.b}.`],
      mistakes: mistakes(isNum(ans), [numMistake(P + (mm - n), 'הוספת את ההפרש. ביחס ישר משנים פי אותו מספר, לא באותה תוספת.')]),
    };
  }
  // level 3: how many can I buy
  const n = p * s1;
  const P = q * s1 * 2;
  const ans = p * s2;
  const Q = q * s2 * 2;
  return {
    subtopicId: id,
    level,
    prompt: `${m(n)} כרטיסים עולים ${m(P)} ש"ח. כמה כרטיסים אפשר לקנות ב-${m(Q)} ש"ח?`,
    answer: { kind: 'number', value: ans, unit: 'כרטיסים' },
    hints: [
      'הפעם יודעים את הסכום ושואלים על הכמות. זה עדיין יחס ישר: יותר כסף, יותר כרטיסים.',
      'כותבים פרופורציה ששומרת על אותו סדר בשני הצדדים, כרטיסים:כסף = כרטיסים:כסף, ופותרים.',
      `כתבי: ${m(`${n}:${P} = x:${Q}`)}`,
    ],
    solution: [`${m(`${n}:${P} = x:${Q}`)}`, `${m(`${P} × x = ${n} × ${Q} = ${n * Q}`)}`, `${m(`x = ${n * Q} ÷ ${P} = ${ans}`)}`],
    mistakes: mistakes(isNum(ans), [numMistake((P * Q) / n, 'הפכת את הסדר בפרופורציה. בשני הצדדים הסדר צריך להיות זהה: כרטיסים לכסף.')]),
  };
}

export const proportionUnit: UnitContent = {
  hook: {
    title: 'מחיר בסופר',
    text: '3 יוגורטים עולים 12 ש"ח. כמה עולים 7? בלי לחשוב פעמיים את יודעת שיותר יוגורטים עולים יותר כסף, ובאותו קצב. כשהכמות והמחיר "הולכים ביחד" ככה, אפשר לכתוב פרופורציה ולמצוא כל מספר חסר.',
  },
  tricks: [
    'פרופורציה = שני יחסים שווים: {{a:b = c:d}}.',
    'כפל בהצלבה: {{a × d = b × c}}. עובד תמיד, גם כשאין "פי כמה" פשוט.',
    'בבעיה מילולית: שומרים על אותו סדר בשני הצדדים, למשל כמות:מחיר = כמות:מחיר.',
  ],
  commonMistakes: [
    { title: 'להוסיף במקום להכפיל', text: 'אם 4 מחברות עולות 10, אז 6 מחברות לא עולות 12. מוצאים כמה עולה אחת (2.5), ואז {{6 × 2.5 = 15}}.' },
    { title: 'לערבב את הסדר', text: 'אם בצד אחד כתבת כמות:מחיר, גם בצד השני חייב להיות כמות:מחיר.' },
    { title: 'כפל בהצלבה עקום', text: 'כופלים באלכסון: הראשון ברביעי והשני בשלישי. לא הראשון בשני.' },
  ],
  subtopics: [
    {
      id: 'proportion.check',
      title: 'פרופורציה: שוויון בין יחסים',
      addedIn: V,
      generate: check,
      explanations: [
        {
          label: 'טבלה',
          title: 'פרופורציה = אותו מתכון בשני גדלים',
          interactive: 'ratioTable',
          paragraphs: [
            'כשיחס אחד הוא "הגדלה" של יחס אחר, הם שווים. כותבים את השוויון ביניהם, וזו **פרופורציה**.',
            '{{4:10 = 12:30}}, כי שני המספרים גדלו פי 3.',
            'שחקי בטבלה: כל עמודה חדשה היא הגדלה של הראשונה, וכל שתי עמודות יוצרות פרופורציה.',
          ],
        },
        {
          label: 'כפל בהצלבה',
          title: 'בדיקה שעובדת תמיד',
          paragraphs: [
            'לפעמים קשה לראות "פי כמה", למשל ב-{{6:9 = 8:12}}.',
            'בודקים בכפל בהצלבה: **הראשון × הרביעי** מול **השני × השלישי**.',
            'אם המכפלות שוות, זו פרופורציה.',
          ],
          example: { question: 'האם {{6:9 = 8:12}}?', steps: ['{{6 × 12 = 72}}', '{{9 × 8 = 72}}', 'שוות, אז כן, זו פרופורציה.'] },
        },
      ],
    },
    {
      id: 'proportion.missing',
      title: 'חישוב גודל חסר בפרופורציה',
      addedIn: V,
      generate: missing,
      explanations: [
        {
          label: 'פי כמה',
          title: 'כשרואים "פי כמה"',
          paragraphs: ['ב-{{3:5 = 12:x}}: {{3}} הפך ל-{{12}}, כלומר גדל פי 4.', 'לכן גם {{5}} גדל פי 4: {{x = 20}}.'],
        },
        {
          label: 'כפל בהצלבה',
          title: 'כשאין "פי כמה" פשוט',
          paragraphs: ['ב-{{6:9 = 8:x}}, 6 לא הופך ל-8 בכפל פשוט.', 'משתמשים בכפל בהצלבה, והופכים את הפרופורציה למשוואה רגילה.'],
          example: { question: '{{6:9 = 8:x}}', steps: ['{{6 × x = 9 × 8}}', '{{6x = 72}}', '{{x = 72 ÷ 6 = 12}}'] },
        },
      ],
    },
    {
      id: 'proportion.direct',
      title: 'יחס ישר בבעיות מילוליות',
      addedIn: V,
      generate: direct,
      explanations: [
        {
          label: 'אחד',
          title: 'שיטת "כמה עולה אחד"',
          paragraphs: [
            'שני גדלים הם **ביחס ישר** אם כשאחד גדל פי 2, גם השני גדל פי 2. למשל כמות ומחיר, או זמן וכמות מים.',
            'הדרך הכי טבעית: מוצאים כמה עולה **אחד**, וכופלים בכמות שמבקשים.',
          ],
          example: { question: '4 מחברות ב-10 ש"ח. כמה עולות 6?', steps: ['אחת: {{10 ÷ 4 = 2.5}}', 'שש: {{6 × 2.5 = 15}} ש"ח'] },
        },
        {
          label: 'פרופורציה',
          title: 'לכתוב פרופורציה',
          paragraphs: ['כותבים יחס עם אותו סדר בשני הצדדים, למשל מחברות:ש"ח = מחברות:ש"ח.', 'שמים x במקום החסר ופותרים בכפל בהצלבה.'],
          example: { question: '4 מחברות ב-10 ש"ח. כמה עולות 6?', steps: ['{{4:10 = 6:x}}', '{{4x = 60}}', '{{x = 15}}'] },
        },
      ],
    },
  ],
};
