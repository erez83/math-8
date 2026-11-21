import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, shuffle, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake, pt } from '../helpers';
import { fmt } from '../../lib/answer';

const V = '0.4.0';
const BASE = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
];

function triple(rng: Rng, level: Level): [number, number, number] {
  const t = level === 1 ? pick(rng, BASE.slice(0, 2)) : pick(rng, BASE);
  const k = level === 1 ? int(rng, 1, 2) : int(rng, 1, 4);
  const [a, b, c] = t.map((x) => x * k);
  return rng() < 0.5 ? [a, b, c] : [b, a, c];
}

const round1 = (x: number) => Math.round(x * 10) / 10;
const ROUND_NOTE = '(עגלי לעשירית, ספרה אחת אחרי הנקודה)';

// ---------- pythagoras.hypotenuse ----------
function hypotenuse(level: Level, rng: Rng): Exercise {
  const id = 'pythagoras.hypotenuse';
  let a: number, b: number, c: number;
  if (level === 3) {
    a = int(rng, 2, 12);
    b = int(rng, 2, 12);
    c = round1(Math.sqrt(a * a + b * b));
    if (Number.isInteger(Math.sqrt(a * a + b * b))) return hypotenuse(level, rng);
  } else [a, b, c] = triple(rng, level);
  return {
    subtopicId: id,
    level,
    prompt: `במשולש ישר-זווית, אורכי הניצבים הם ${m(a)} ס"מ ו-${m(b)} ס"מ. מה אורך היתר?${level === 3 ? ' ' + ROUND_NOTE : ''}`,
    answer: { kind: 'number', value: c, unit: 'ס"מ', tolerance: level === 3 ? 0.051 : undefined },
    hints: [
      'מחפשים את היתר, הצלע הארוכה שמול הזווית הישרה. ידועים שני הניצבים.',
      'משפט פיתגורס: ניצב² + ניצב² = יתר². מחשבים את סכום הריבועים, ואז מוציאים שורש כדי לחזור מ"יתר²" ל"יתר".',
      `${m(`${a}² + ${b}² = ?`)}`,
    ],
    solution: [`${m(`${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`)}`, `${m(`יתר = √${a * a + b * b} ${level === 3 ? '≈' : '='} ${fmt(c)}`)} ס"מ`],
    mistakes: mistakes(isNum(c), [numMistake(a + b, 'חיברת את הניצבים. במשפט פיתגורס מחברים את **הריבועים** שלהם, ואז מוציאים שורש.'), numMistake(a * a + b * b, 'זה היתר בריבוע. נשאר להוציא שורש.')]),
    visual: { type: 'triangle', a: String(a), b: String(b), c: '?' },
  };
}

// ---------- pythagoras.leg ----------
function leg(level: Level, rng: Rng): Exercise {
  const id = 'pythagoras.leg';
  let a: number, b: number, c: number;
  if (level === 3) {
    c = int(rng, 6, 15);
    a = int(rng, 2, c - 1);
    b = round1(Math.sqrt(c * c - a * a));
    if (Number.isInteger(Math.sqrt(c * c - a * a))) return leg(level, rng);
  } else [a, b, c] = triple(rng, level);
  return {
    subtopicId: id,
    level,
    prompt: `במשולש ישר-זווית, היתר באורך ${m(c)} ס"מ ואחד הניצבים באורך ${m(a)} ס"מ. מה אורך הניצב השני?${level === 3 ? ' ' + ROUND_NOTE : ''}`,
    answer: { kind: 'number', value: b, unit: 'ס"מ', tolerance: level === 3 ? 0.051 : undefined },
    hints: [
      'הפעם ידוע היתר, וחסר ניצב. הניצב קצר מהיתר, אז התשובה חייבת להיות קטנה מ-' + m(c) + '.',
      'אותו משפט, הפוך: ניצב² = יתר² פחות הניצב הידוע בריבוע. מחסירים, ואז מוציאים שורש.',
      `${m(`${c}² − ${a}² = ?`)}`,
    ],
    solution: [`${m(`${c}² − ${a}² = ${c * c} − ${a * a} = ${c * c - a * a}`)}`, `${m(`ניצב = √${c * c - a * a} ${level === 3 ? '≈' : '='} ${fmt(b)}`)} ס"מ`],
    mistakes: mistakes(isNum(b), [
      numMistake(round1(Math.sqrt(c * c + a * a)), 'חיברת את הריבועים. כשמחפשים **ניצב**, מחסירים: יתר² − ניצב².'),
      numMistake(c - a, 'חיסרת את האורכים עצמם. צריך לחסר את **הריבועים**, ואז להוציא שורש.'),
    ]),
    visual: { type: 'triangle', a: String(a), b: '?', c: String(c) },
  };
}

// ---------- pythagoras.converse ----------
function converse(level: Level, rng: Rng): Exercise {
  const id = 'pythagoras.converse';
  if (level === 3) {
    const right = triple(rng, 2);
    const fakes = [0, 1, 2].map(() => {
      const [a, b, c] = triple(rng, 2);
      return [a, b, c + pick(rng, [1, -1, 2])];
    });
    const fmtT = (t: number[]) => m(shuffle(rng, t).join(', '));
    const rightS = fmtT(right);
    const options = shuffle(rng, Array.from(new Set([rightS, ...fakes.map(fmtT)])));
    return {
      subtopicId: id,
      level,
      prompt: 'איזה משולש, לפי אורכי צלעותיו, הוא משולש ישר-זווית?',
      answer: { kind: 'choice', options, correct: options.indexOf(rightS) },
      hints: [
        'צריך לבדוק עבור כל משולש אם הוא מקיים את משפט פיתגורס.',
        'המשפט ההפוך: אם סכום הריבועים של שתי הצלעות הקצרות שווה לריבוע של הצלע הארוכה, המשולש ישר-זווית. שימי לב: הצלעות לא תמיד כתובות לפי הסדר.',
        'בכל תשובה מצאי את הצלע הארוכה, והשווי את הריבוע שלה לסכום הריבועים של שתי האחרות.',
      ],
      solution: [`${rightS}: ${m(`${right[0]}² + ${right[1]}² = ${right[0] ** 2 + right[1] ** 2} = ${right[2]}²`)}`],
      mistakes: [],
    };
  }
  const [a, b, c0] = triple(rng, level);
  const isRight = rng() < 0.5;
  const c = isRight ? c0 : c0 + pick(rng, [1, -1, 2]);
  const sides = level === 2 ? shuffle(rng, [a, b, c]) : [a, b, c];
  const longest = Math.max(a, b, c);
  const others = [a, b, c].filter((x, i, arr) => !(x === longest && arr.indexOf(x) === i));
  const holds = others[0] ** 2 + others[1] ** 2 === longest ** 2;
  return {
    subtopicId: id,
    level,
    prompt: `האם משולש שאורכי צלעותיו ${m(sides.join(', '))} הוא ישר-זווית?`,
    answer: { kind: 'choice', options: ['כן', 'לא'], correct: holds ? 0 : 1 },
    hints: [
      'לא נתון שיש זווית ישרה. צריך לבדוק אם היא קיימת, לפי הצלעות בלבד.',
      'המשפט ההפוך לפיתגורס: אם שתי הצלעות הקצרות בריבוע שוות ביחד לצלע הארוכה בריבוע, יש זווית ישרה. אחרת אין.',
      `הצלע הארוכה: ${m(longest)}. חשבי ${m(`${others[0]}² + ${others[1]}²`)} והשווי ל-${m(`${longest}²`)}.`,
    ],
    solution: [`${m(`${others[0]}² + ${others[1]}² = ${others[0] ** 2 + others[1] ** 2}`)}`, `${m(`${longest}² = ${longest ** 2}`)}`, holds ? 'שווים, אז המשולש ישר-זווית.' : 'לא שווים, אז המשולש לא ישר-זווית.'],
    mistakes: [],
  };
}

// ---------- pythagoras.applications ----------
function applications(level: Level, rng: Rng): Exercise {
  const id = 'pythagoras.applications';
  if (level === 1) {
    const [a, b, c] = triple(rng, 2);
    const [base, height] = a < b ? [a, b] : [b, a];
    return {
      subtopicId: id,
      level,
      prompt: `סולם באורך ${m(c * 10)} ס"מ נשען על קיר. הרגל של הסולם נמצאת ${m(base * 10)} ס"מ מהקיר. לאיזה גובה על הקיר מגיע הסולם?`,
      answer: { kind: 'number', value: height * 10, unit: 'ס"מ' },
      hints: [
        'הקיר, הרצפה והסולם יוצרים משולש ישר-זווית: הקיר עומד ישר על הרצפה.',
        'הסולם הוא היתר (מול הזווית הישרה). המרחק מהקיר והגובה הם הניצבים. מחפשים ניצב: יתר² פחות ניצב².',
        `${m(`${c * 10}² − ${base * 10}²`)}`,
      ],
      solution: [`${m(`${c * 10}² − ${base * 10}² = ${(c * 10) ** 2 - (base * 10) ** 2}`)}`, `${m(`√${(c * 10) ** 2 - (base * 10) ** 2} = ${height * 10}`)} ס"מ`],
      mistakes: mistakes(isNum(height * 10), [numMistake(Math.round(Math.sqrt((c * 10) ** 2 + (base * 10) ** 2)), 'הסולם הוא היתר, הצלע הארוכה. כשמחפשים ניצב, מחסירים ריבועים.')]),
      visual: { type: 'triangle', a: `${base * 10}`, b: '?', c: `${c * 10}` },
    };
  }
  if (level === 2) {
    const [w, h, d] = pick(rng, [
      [16, 12, 20],
      [32, 24, 40],
      [48, 36, 60],
      [40, 30, 50],
      [24, 18, 30],
    ]);
    return {
      subtopicId: id,
      level,
      prompt: `גודל של מסך נמדד לפי **האלכסון** שלו. מסך ברוחב ${m(w)} אינץ' ובגובה ${m(h)} אינץ'. מה גודל המסך?`,
      answer: { kind: 'number', value: d, unit: 'אינץ\'' },
      hints: [
        'האלכסון של מלבן מחלק אותו לשני משולשים ישרי-זווית.',
        'הרוחב והגובה הם הניצבים, והאלכסון הוא היתר. משתמשים בפיתגורס.',
        `${m(`${w}² + ${h}²`)}`,
      ],
      solution: [`${m(`${w}² + ${h}² = ${w * w + h * h}`)}`, `${m(`√${w * w + h * h} = ${d}`)} אינץ'`],
      mistakes: mistakes(isNum(d), [numMistake(w + h, 'חיברת את הרוחב והגובה. צריך פיתגורס: ריבועים ואז שורש.')]),
      visual: { type: 'shape', kind: 'rect', labels: { w: String(w), h: String(h) } },
    };
  }
  const [a, b, c] = triple(rng, 1);
  const x1 = int(rng, -5, 0);
  const y1 = int(rng, -4, 0);
  const x2 = x1 + a;
  const y2 = y1 + b;
  return {
    subtopicId: id,
    level,
    prompt: `מה המרחק בין הנקודות ${m(pt(x1, y1))} ו-${m(pt(x2, y2))}?`,
    answer: { kind: 'number', value: c },
    hints: [
      'המרחק הוא הקו הישר בין הנקודות, באלכסון. אפשר לבנות סביבו משולש ישר-זווית.',
      'הניצבים הם ההפרש בין ערכי x (תזוזה אופקית) וההפרש בין ערכי y (תזוזה אנכית). המרחק הוא היתר.',
      `ההפרש ב-x: ${m(`${x2} − (${x1})`)}. ההפרש ב-y: ${m(`${y2} − (${y1})`)}.`,
    ],
    solution: [`ניצבים: ${m(a)} ו-${m(b)}.`, `${m(`√(${a}² + ${b}²) = √${a * a + b * b} = ${c}`)}`],
    mistakes: mistakes(isNum(c), [numMistake(a + b, 'חיברת את התזוזות. המרחק בקו ישר קצר יותר: פיתגורס.')]),
  };
}

// ---------- pythagoras.space ----------
const BOX_DIAG = [
  [1, 2, 2, 3],
  [2, 3, 6, 7],
  [1, 4, 8, 9],
  [2, 6, 9, 11],
  [4, 4, 7, 9],
  [6, 6, 7, 11],
  [3, 4, 12, 13],
  [2, 10, 11, 15],
];

function space(level: Level, rng: Rng): Exercise {
  const id = 'pythagoras.space';
  if (level === 1) {
    const [a, b, c] = triple(rng, 1);
    const h = int(rng, 2, 9);
    return {
      subtopicId: id,
      level,
      prompt: `לתיבה אורך ${m(a)} ס"מ, רוחב ${m(h)} ס"מ וגובה ${m(b)} ס"מ. מה אורך האלכסון של הפאה הקדמית (אורך × גובה)?`,
      answer: { kind: 'number', value: c, unit: 'ס"מ' },
      hints: [
        'הפאה הקדמית היא מלבן. האלכסון שלה הוא יתר במשולש ישר-זווית שנמצא על הפאה.',
        'רק שתי צלעות של הפאה משתתפות: האורך והגובה. הרוחב לא שייך לפאה הזאת. פיתגורס על שתיהן.',
        `${m(`${a}² + ${b}²`)}`,
      ],
      solution: [`${m(`${a}² + ${b}² = ${a * a + b * b}`)}`, `${m(`√${a * a + b * b} = ${c}`)} ס"מ`],
      mistakes: mistakes(isNum(c), [numMistake(Math.round(Math.sqrt(a * a + b * b + h * h) * 10) / 10, 'זה האלכסון הראשי של כל התיבה. כאן שואלים רק על הפאה הקדמית, בלי הרוחב.')]),
      visual: { type: 'box', length: String(a), width: String(h), height: String(b), diagonal: 'face' },
    };
  }
  if (level === 2) {
    const [x, y, z, d] = pick(rng, BOX_DIAG);
    const k = int(rng, 1, 3);
    const [a, b, c, D] = [x * k, y * k, z * k, d * k];
    return {
      subtopicId: id,
      level,
      prompt: `מידות תיבה: ${m(a)} ס"מ, ${m(b)} ס"מ, ${m(c)} ס"מ. מה אורך האלכסון הראשי שלה (מפינה לפינה הנגדית, דרך פנים התיבה)?`,
      answer: { kind: 'number', value: D, unit: 'ס"מ' },
      hints: [
        'האלכסון הראשי עובר דרך פנים התיבה. כדי להגיע אליו צריך פיתגורס פעמיים.',
        'קודם מחשבים את אלכסון הבסיס (פיתגורס על האורך והרוחב). אחר כך האלכסון הראשי הוא יתר במשולש שבו הניצבים הם אלכסון הבסיס והגובה. בקיצור: שורש של סכום שלושת הריבועים.',
        `${m(`${a}² + ${b}² + ${c}²`)}`,
      ],
      solution: [`${m(`${a}² + ${b}² + ${c}² = ${a * a + b * b + c * c}`)}`, `${m(`√${a * a + b * b + c * c} = ${D}`)} ס"מ`],
      mistakes: mistakes(isNum(D), [numMistake(a + b + c, 'חיברת את המידות. צריך לחבר את **הריבועים** ולהוציא שורש.')]),
      visual: { type: 'box', length: String(a), width: String(b), height: String(c), diagonal: 'main' },
    };
  }
  const a = int(rng, 2, 12);
  const ans = round1(a * Math.sqrt(3));
  return {
    subtopicId: id,
    level,
    prompt: `מה אורך האלכסון הראשי של קובייה שאורך צלעה ${m(a)} ס"מ? ${ROUND_NOTE}`,
    answer: { kind: 'number', value: ans, unit: 'ס"מ', tolerance: 0.051 },
    hints: [
      'קובייה היא תיבה שכל המידות שלה שוות. האלכסון הראשי עובר מפינה לפינה הנגדית.',
      'כמו בתיבה: שורש של סכום הריבועים של שלוש המידות. כאן שלושתן שוות.',
      `${m(`√(${a}² + ${a}² + ${a}²) = √${3 * a * a}`)}`,
    ],
    solution: [`${m(`${a}² × 3 = ${3 * a * a}`)}`, `${m(`√${3 * a * a} ≈ ${fmt(ans)}`)} ס"מ`],
    mistakes: mistakes(isNum(ans), [numMistake(round1(a * Math.sqrt(2)), 'זה האלכסון של פאה אחת. האלכסון הראשי עובר דרך פנים הקובייה.')]),
    visual: { type: 'box', length: String(a), width: String(a), height: String(a), diagonal: 'main' },
  };
}

export const pythagorasUnit: UnitContent = {
  hook: {
    title: 'מסך הטלוויזיה',
    text: 'כשכתוב "טלוויזיה 55 אינץ\'", זה לא הרוחב: זה האלכסון. איך יודעים אותו בלי סרגל ארוך? פיתגורס גילה לפני 2,500 שנה קשר מדהים בין הצלעות של כל משולש ישר-זווית, והוא עובד עד היום: במסכים, בסולמות, בבנייה ובמפות.',
  },
  tricks: [
    'ניצב² + ניצב² = יתר². היתר הוא תמיד הצלע הארוכה, מול הזווית הישרה.',
    'מחפשים יתר: מחברים ריבועים. מחפשים ניצב: מחסירים ריבועים.',
    'שלשות קסם: 3-4-5, 5-12-13, 8-15-17, וגם הכפולות שלהן, כמו 6-8-10.',
    'אלכסון ראשי של תיבה: √(a² + b² + c²).',
  ],
  commonMistakes: [
    { title: 'לשכוח שורש', text: '{{3² + 4² = 25}}, אבל היתר הוא {{√25 = 5}}, לא 25.' },
    { title: 'לחבר צלעות', text: '{{3 + 4 = 7}}, אבל היתר הוא 5. מחברים ריבועים, לא צלעות.' },
    { title: 'לחבר כשמחפשים ניצב', text: 'אם ידוע היתר, הניצב **קטן** ממנו: מחסירים.' },
  ],
  subtopics: [
    {
      id: 'pythagoras.hypotenuse',
      title: 'חישוב היתר',
      addedIn: V,
      generate: hypotenuse,
      explanations: [
        {
          label: 'ריבועים',
          title: 'הריבועים על הצלעות',
          interactive: 'pythagorasSquares',
          paragraphs: ['בונים ריבוע על כל צלע של משולש ישר-זווית.', 'השטח של הריבוע הגדול (על היתר) שווה בדיוק לסכום השטחים של שני הריבועים הקטנים: {{9 + 16 = 25}}.', 'שחקי בהדמיה: הגדילי את המשולש, והקשר נשמר.'],
        },
        {
          label: 'שלבים',
          title: 'חישוב יתר בשלושה שלבים',
          paragraphs: ['1. ריבוע של כל ניצב.', '2. חיבור.', '3. שורש.'],
          example: { question: 'ניצבים 6 ו-8', steps: ['{{36 + 64 = 100}}', '{{√100 = 10}}'] },
        },
      ],
    },
    {
      id: 'pythagoras.leg',
      title: 'חישוב ניצב',
      addedIn: V,
      generate: leg,
      explanations: [
        {
          label: 'הפוך',
          title: 'כשהיתר ידוע',
          paragraphs: ['יתר² = ניצב² + ניצב², ולכן: ניצב² = יתר² − הניצב השני².', 'מחסירים ומוציאים שורש.'],
          example: { question: 'יתר 13, ניצב 5', steps: ['{{169 − 25 = 144}}', '{{√144 = 12}}'] },
        },
        {
          label: 'בדיקה',
          title: 'בדיקת היגיון',
          paragraphs: ['הניצב **תמיד קטן** מהיתר.', 'אם יצא לך ניצב גדול מהיתר, כנראה חיברת במקום לחסר.'],
        },
      ],
    },
    {
      id: 'pythagoras.converse',
      title: 'האם המשולש ישר-זווית?',
      addedIn: V,
      generate: converse,
      explanations: [
        {
          label: 'משפט הפוך',
          title: 'המשפט ההפוך',
          paragraphs: ['אם a² + b² = c² (כש-c הצלע הארוכה), המשולש **בטוח** ישר-זווית.', 'אם לא שווה, אין בו זווית ישרה.'],
          example: { question: 'צלעות 9, 12, 15', steps: ['{{81 + 144 = 225}}', '{{15² = 225}} ✓', 'ישר-זווית'] },
        },
        {
          label: 'חבל',
          title: 'הטריק של המצרים',
          paragraphs: ['במצרים העתיקה קשרו חבל עם 12 קשרים במרחקים שווים, ומתחו אותו למשולש 3-4-5.', 'כך קיבלו זווית ישרה מדויקת לבניית פירמידות.'],
        },
      ],
    },
    {
      id: 'pythagoras.applications',
      title: 'יישומים של משפט פיתגורס',
      addedIn: V,
      generate: applications,
      explanations: [
        {
          label: 'לחפש משולש',
          title: 'למצוא את המשולש הנסתר',
          paragraphs: ['בכל שאלה מחפשים זווית ישרה: קיר ורצפה, צלעות של מלבן, צירים במערכת צירים.', 'מסמנים מי היתר (מול הזווית הישרה) ומי הניצבים.'],
        },
        {
          label: 'מרחק בין נקודות',
          title: 'מרחק בין שתי נקודות',
          paragraphs: ['מהנקודה הראשונה הולכים אופקית, ואז אנכית, עד הנקודה השנייה. אלה הניצבים.', 'המרחק בקו ישר הוא היתר.'],
          example: { question: '(1, 1) ו-(4, 5)', steps: ['אופקי: 3, אנכי: 4', '{{√(9 + 16) = 5}}'] },
        },
      ],
    },
    {
      id: 'pythagoras.space',
      title: 'פיתגורס במרחב: אלכסונים בתיבה',
      addedIn: V,
      generate: space,
      explanations: [
        {
          label: 'פאה',
          title: 'אלכסון של פאה',
          paragraphs: ['כל פאה של תיבה היא מלבן. האלכסון שלה: פיתגורס על שתי הצלעות של הפאה בלבד.'],
        },
        {
          label: 'אלכסון ראשי',
          title: 'האלכסון הראשי: פיתגורס פעמיים',
          paragraphs: ['1. אלכסון הבסיס: {{√(a² + b²)}}.', '2. האלכסון הראשי הוא יתר במשולש עם אלכסון הבסיס והגובה.', 'יחד: {{√(a² + b² + c²)}}.'],
          example: { question: 'תיבה 2 × 3 × 6', steps: ['{{4 + 9 + 36 = 49}}', '{{√49 = 7}}'] },
        },
      ],
    },
  ],
};
