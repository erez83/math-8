import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, gcd, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake } from '../helpers';

const V = '0.3.0';
const MINUS = '−';

/** "3x", "x", "−x", "−4x" */
function xTerm(a: number): string {
  if (a === 1) return 'x';
  if (a === -1) return `${MINUS}x`;
  return a < 0 ? `${MINUS}${-a}x` : `${a}x`;
}

/** Appends a constant with its sign: "3x" + 5 → "3x + 5", + (−5) → "3x − 5". */
function plus(expr: string, c: number): string {
  if (c === 0) return expr;
  return c > 0 ? `${expr} + ${c}` : `${expr} ${MINUS} ${-c}`;
}

function num(n: number): string {
  return n < 0 ? `${MINUS}${-n}` : String(n);
}

/** Non-zero integer in [min, max]. */
function nz(rng: Rng, min: number, max: number): number {
  for (;;) {
    const v = int(rng, min, max);
    if (v !== 0) return v;
  }
}

const SOLVE_IDEA =
  'חושבים על מאזניים: מבודדים את x בפעולות הפוכות, וכל פעולה עושים **לשני האגפים**. קודם מבטלים חיבור או חיסור, ורק אחר כך כפל או חילוק.';

// ---------- equations.basic ----------
function basic(level: Level, rng: Rng): Exercise {
  const id = 'equations.basic';
  if (level === 1) {
    const x = int(rng, 2, 15);
    const kind = pick(rng, ['add', 'sub', 'mul', 'div'] as const);
    const a = int(rng, 2, 12);
    const eq =
      kind === 'add' ? `x + ${a} = ${x + a}` : kind === 'sub' ? `x ${MINUS} ${a} = ${x - a}` : kind === 'mul' ? `${a}x = ${a * x}` : `x/${a} = ${x}`;
    const ans = kind === 'div' ? x * a : x;
    const inverse = { add: `להחסיר ${m(a)}`, sub: `להוסיף ${m(a)}`, mul: `לחלק ב-${m(a)}`, div: `לכפול ב-${m(a)}` }[kind];
    return {
      subtopicId: id,
      level,
      prompt: `פתרי את המשוואה: ${m(eq)}`,
      answer: { kind: 'number', value: ans },
      hints: [
        'מחפשים את המספר שאפשר לשים במקום x כך שהמשוואה תהיה נכונה.',
        'מה עשו ל-x? עושים את הפעולה ההפוכה, לשני האגפים, וכך x נשאר לבד.',
        `כאן צריך ${inverse} משני האגפים.`,
      ],
      solution: [`${inverse} משני האגפים.`, `${m(`x = ${ans}`)}`, `בדיקה: מציבים ${m(ans)} במשוואה ומקבלים שוויון נכון.`],
      mistakes: mistakes(
        isNum(ans),
        kind === 'add'
          ? [numMistake(2 * a + x, 'הוספת במקום להחסיר. כדי לבטל "+", מחסירים.')]
          : kind === 'sub'
            ? [numMistake(x - 2 * a, 'החסרת במקום להוסיף. כדי לבטל "−", מוסיפים.')]
            : kind === 'mul'
              ? [numMistake(a * x * a, 'כפלת במקום לחלק. כדי לבטל כפל, מחלקים.')]
              : [numMistake(x / a, 'חילקת במקום לכפול. כדי לבטל חילוק, כופלים.')],
      ),
    };
  }
  // ax + b = c (level 2) or with negative coefficient (level 3)
  const x = level === 2 ? nz(rng, -6, 12) : nz(rng, -9, 9);
  const a = level === 2 ? int(rng, 2, 9) : -int(rng, 2, 7);
  const b = nz(rng, -15, 15);
  const c = a * x + b;
  const eq = level === 3 && rng() < 0.5 ? `${b} ${a < 0 ? MINUS : '+'} ${xTerm(Math.abs(a))} = ${num(c)}` : `${plus(xTerm(a), b)} = ${num(c)}`;
  return {
    subtopicId: id,
    level,
    prompt: `פתרי את המשוואה: ${m(eq)}`,
    answer: { kind: 'number', value: x },
    hints: [
      'משוואה בשני צעדים: על x עשו גם כפל וגם חיבור או חיסור.',
      SOLVE_IDEA + (a < 0 ? ' שימי לב לסימן המינוס שליד x: מחלקים במספר שלילי.' : ''),
      b > 0 ? `הצעד הראשון: להחסיר ${m(b)} משני האגפים.` : `הצעד הראשון: להוסיף ${m(-b)} לשני האגפים.`,
    ],
    solution: [
      b > 0 ? `מחסירים ${m(b)}: ${m(`${xTerm(a)} = ${num(c - b)}`)}` : `מוסיפים ${m(-b)}: ${m(`${xTerm(a)} = ${num(c - b)}`)}`,
      `מחלקים ב-${m(num(a))}: ${m(`x = ${num(x)}`)}`,
    ],
    mistakes: mistakes(isNum(x), [
      numMistake((c + b) / a, b > 0 ? `העברת את ${m(b)} עם הסימן הלא נכון. כדי לבטל "+${b}", **מחסירים** ${m(b)} משני האגפים.` : 'העברת את המספר עם הסימן הלא נכון. כדי לבטל חיסור, מוסיפים.'),
      numMistake(-x, 'קיבלת את המספר הנכון עם סימן הפוך. בדקי את החילוק במספר השלילי.'),
      numMistake(c - b, `שכחת את הצעד האחרון: לחלק ב-${m(num(a))}.`),
    ]),
  };
}

// ---------- equations.both-sides ----------
function bothSides(level: Level, rng: Rng): Exercise {
  const id = 'equations.both-sides';
  const x = nz(rng, -8, 10);
  if (level === 1) {
    let a = int(rng, 2, 9);
    let c = int(rng, 1, 8);
    if (a === c) a++;
    if (a < c) [a, c] = [c, a];
    const b = nz(rng, -12, 12);
    const d = (a - c) * x + b;
    return {
      subtopicId: id,
      level,
      prompt: `פתרי את המשוואה: ${m(`${plus(xTerm(a), b)} = ${plus(xTerm(c), d)}`)}`,
      answer: { kind: 'number', value: x },
      hints: [
        'יש x בשני האגפים. המטרה: לאסוף את כל ה-x לצד אחד ואת כל המספרים לצד השני.',
        'מעבירים איברים בפעולה הפוכה לשני האגפים: קודם מחסירים את ה-x מהצד שבו יש פחות x, ואז מטפלים במספרים כמו במשוואה רגילה.',
        `הצעד הראשון: להחסיר ${m(xTerm(c))} משני האגפים.`,
      ],
      solution: [`מחסירים ${m(xTerm(c))}: ${m(`${plus(xTerm(a - c), b)} = ${num(d)}`)}`, `${m(`${xTerm(a - c)} = ${num(d - b)}`)}`, `${m(`x = ${num(x)}`)}`],
      mistakes: mistakes(isNum(x), [numMistake((d - b) / (a + c), 'חיברת את ה-x משני הצדדים. כשמעבירים איבר לצד השני הסימן מתהפך, ולכן מחסירים.')]),
    };
  }
  if (level === 2) {
    const a = int(rng, 2, 7);
    const b = nz(rng, -9, 9);
    const c = a * (x + b);
    return {
      subtopicId: id,
      level,
      prompt: `פתרי את המשוואה: ${m(`${a}(${plus('x', b)}) = ${num(c)}`)}`,
      answer: { kind: 'number', value: x },
      hints: [
        'יש כאן סוגריים. המספר שלפניהם כופל את **כל** מה שבתוכם.',
        `שתי דרכים: לפתוח סוגריים (חוק הפילוג), או לחלק קודם את שני האגפים ב-${m(a)}. שתיהן נכונות.`,
        `פתיחת סוגריים: ${m(`${a} × x`)} וגם ${m(`${a} × ${num(b)}`)}`,
      ],
      solution: [`פותחים סוגריים: ${m(`${plus(xTerm(a), a * b)} = ${num(c)}`)}`, `${m(`${xTerm(a)} = ${num(c - a * b)}`)}`, `${m(`x = ${num(x)}`)}`],
      mistakes: mistakes(isNum(x), [numMistake((c - b) / a, `כשפתחת את הסוגריים, לא כפלת את ${m(num(b))} ב-${m(a)}. המספר שלפני הסוגריים כופל את כל מה שבתוכם.`)]),
    };
  }
  const a = int(rng, 2, 6);
  let c = int(rng, 1, 9);
  if (c === a) c++;
  const b = nz(rng, -6, 6);
  const d = a * (x + b) - c * x;
  return {
    subtopicId: id,
    level,
    prompt: `פתרי את המשוואה: ${m(`${a}(${plus('x', b)}) = ${plus(xTerm(c), d)}`)}`,
    answer: { kind: 'number', value: x },
    hints: [
      'יש גם סוגריים וגם x בשני האגפים. עובדים לפי סדר, צעד אחד בכל פעם.',
      '(1) פותחים סוגריים. (2) אוספים את ה-x לצד אחד ואת המספרים לצד השני. (3) מחלקים.',
      `פתחי סוגריים: ${m(`${plus(xTerm(a), a * b)} = ${plus(xTerm(c), d)}`)}`,
    ],
    solution: [
      `${m(`${plus(xTerm(a), a * b)} = ${plus(xTerm(c), d)}`)}`,
      `${m(`${xTerm(a - c)} = ${num(d - a * b)}`)}`,
      `${m(`x = ${num(x)}`)}`,
    ],
    mistakes: mistakes(isNum(x), [numMistake((d - b) / (a - c), 'כשפתחת סוגריים לא כפלת את כל מה שבתוכם.')]),
  };
}

// ---------- equations.fractions ----------
function fractions(level: Level, rng: Rng): Exercise {
  const id = 'equations.fractions';
  if (level === 1) {
    const a = int(rng, 2, 9);
    const t = nz(rng, -5, 9);
    const x = a * t;
    const b = nz(rng, -9, 9);
    const c = t + b;
    return {
      subtopicId: id,
      level,
      prompt: `פתרי את המשוואה: ${m(`${plus(`x/${a}`, b)} = ${num(c)}`)}`,
      answer: { kind: 'number', value: x },
      hints: [
        `x מחולק ב-${m(a)}, ויש גם מספר שנוסף. צריך לבטל את שניהם.`,
        SOLVE_IDEA + ' את החילוק מבטלים בכפל.',
        b > 0 ? `הצעד הראשון: להחסיר ${m(b)} משני האגפים.` : `הצעד הראשון: להוסיף ${m(-b)} לשני האגפים.`,
      ],
      solution: [`${m(`x/${a} = ${num(c - b)}`)}`, `כופלים ב-${m(a)}: ${m(`x = ${num(x)}`)}`],
      mistakes: mistakes(isNum(x), [numMistake(c * a - b, `כפלת ב-${m(a)} לפני שביטלת את ${m(num(b))}, אבל לא כפלת גם אותו. קודם מבטלים חיבור או חיסור.`), numMistake(c - b, `שכחת לכפול ב-${m(a)} בסוף.`)]),
    };
  }
  if (level === 2) {
    const a = int(rng, 2, 9);
    const b = nz(rng, -9, 9);
    const c = nz(rng, -6, 9);
    const x = a * c - b;
    return {
      subtopicId: id,
      level,
      prompt: `פתרי את המשוואה: ${m(`(${plus('x', b)})/${a} = ${num(c)}`)}`,
      answer: { kind: 'number', value: x },
      hints: [
        `כל הביטוי ${m(plus('x', b))} מחולק ב-${m(a)}. המונה הוא ביטוי שלם, כמו בסוגריים.`,
        'קודם מבטלים את החילוק: כופלים את שני האגפים במכנה. אחר כך פותרים משוואה רגילה.',
        `כפלי את שני האגפים ב-${m(a)}: ${m(`${plus('x', b)} = ${num(c)} × ${a}`)}`,
      ],
      solution: [`${m(`${plus('x', b)} = ${num(a * c)}`)}`, `${m(`x = ${num(x)}`)}`],
      mistakes: mistakes(isNum(x), [numMistake(a * c + b, `העברת את ${m(num(b))} עם הסימן הלא נכון.`), numMistake(c - b, `שכחת לכפול ב-${m(a)}.`)]),
    };
  }
  // x/a + x/b = c
  let a = int(rng, 2, 6);
  let b = int(rng, 2, 6);
  if (a === b) b = a + 1;
  if (a > b) [a, b] = [b, a];
  const L = (a * b) / gcd(a, b);
  const t = nz(rng, -3, 5);
  const x = L * t;
  const c = x / a + x / b;
  return {
    subtopicId: id,
    level,
    prompt: `פתרי את המשוואה: ${m(`x/${a} + x/${b} = ${num(c)}`)}`,
    answer: { kind: 'number', value: x },
    hints: [
      'יש שני שברים עם מכנים שונים. השברים מסבכים, אז כדאי להיפטר מהם.',
      'כופלים את **כל** איברי המשוואה במכנה משותף. כך כל השברים הופכים למספרים שלמים, והמשוואה נעשית רגילה.',
      `מכנה משותף: ${m(L)}. כפלי כל איבר ב-${m(L)}.`,
    ],
    solution: [`כופלים ב-${m(L)}: ${m(`${xTerm(L / a)} + ${xTerm(L / b)} = ${num(c * L)}`)}`, `${m(`${xTerm(L / a + L / b)} = ${num(c * L)}`)}`, `${m(`x = ${num(x)}`)}`],
    mistakes: mistakes(isNum(x), [numMistake((c * (a + b)) / 2, 'חיברת את המכנים. שברים מחברים רק עם מכנה משותף.')]),
  };
}

// ---------- equations.special ----------
const SPECIAL_OPTIONS = ['פתרון אחד', 'כל מספר הוא פתרון', 'אין פתרון'];

function special(level: Level, rng: Rng): Exercise {
  const id = 'equations.special';
  const kind = pick(rng, ['one', 'all', 'none'] as const);
  const a = int(rng, 2, 6);
  const b = nz(rng, -8, 8);
  let eq: string;
  let explain: string[];
  if (level === 1) {
    const b2 = kind === 'none' ? b + nz(rng, -4, 4) : b;
    const a2 = kind === 'one' ? a + int(rng, 1, 3) : a;
    eq = `${plus(xTerm(a), b)} = ${plus(xTerm(a2), b2)}`;
    explain =
      kind === 'one'
        ? [`מחסירים ${m(xTerm(a))}: ${m(`${num(b)} = ${plus(xTerm(a2 - a), b2)}`)}. נשאר x, ויש פתרון אחד.`]
        : kind === 'all'
          ? ['שני האגפים זהים לגמרי, אז כל מספר שנציב יקיים את השוויון.']
          : [`מחסירים ${m(xTerm(a))}: ${m(`${num(b)} = ${num(b2)}`)}. זה שקר, אז אין פתרון.`];
  } else {
    // a(x + b) vs. ax + ab (+ shift)
    const shift = kind === 'none' ? nz(rng, -5, 5) : 0;
    const coef = kind === 'one' ? a + int(rng, 1, 2) : a;
    const right = plus(xTerm(coef), a * b + shift);
    eq = level === 2 ? `${a}(${plus('x', b)}) = ${right}` : `${a}(${plus('x', b)}) ${MINUS} x = ${plus(xTerm(coef - 1), a * b + shift)}`;
    const opened = level === 2 ? plus(xTerm(a), a * b) : plus(xTerm(a - 1), a * b);
    const rightShown = level === 2 ? right : plus(xTerm(coef - 1), a * b + shift);
    explain = [
      `פותחים סוגריים ומפשטים: ${m(`${opened} = ${rightShown}`)}.`,
      kind === 'one'
        ? 'מקדמי x שונים, אז אחרי שמעבירים נשאר x, ויש פתרון אחד.'
        : kind === 'all'
          ? 'שני האגפים זהים, אז כל מספר הוא פתרון.'
          : 'ה-x מתבטל ונשאר שוויון בין שני מספרים שונים. זה שקר, אז אין פתרון.',
    ];
  }
  const correct = kind === 'one' ? 0 : kind === 'all' ? 1 : 2;
  return {
    subtopicId: id,
    level,
    prompt: `כמה פתרונות יש למשוואה ${m(eq)}?`,
    answer: { kind: 'choice', options: SPECIAL_OPTIONS, correct },
    hints: [
      'לא מבקשים למצוא את x, אלא להבין מה יקרה כשננסה לפתור: האם יש פתרון אחד, אין בכלל, או שכל מספר מתאים.',
      'מפשטים כל אגף (פותחים סוגריים), ומעבירים את כל ה-x לצד אחד. אם ה-x **נעלם**, מסתכלים על מה שנשאר: שוויון נכון (כמו 5 = 5) אומר שכל מספר פתרון, ושוויון שקרי (כמו 5 = 7) אומר שאין פתרון.',
      level === 1 ? 'השווי את מקדמי ה-x בשני האגפים. האם הם שווים?' : 'פתחי את הסוגריים והשווי את שני האגפים.',
    ],
    solution: explain,
    mistakes: [],
  };
}

// ---------- equations.word ----------
function word(level: Level, rng: Rng): Exercise {
  const id = 'equations.word';
  if (level === 1) {
    const x = int(rng, 2, 20);
    const a = int(rng, 2, 6);
    const b = int(rng, 1, 15);
    const c = a * x + b;
    return {
      subtopicId: id,
      level,
      prompt: `חשבתי על מספר. כפלתי אותו ב-${m(a)}, הוספתי ${m(b)}, וקיבלתי ${m(c)}. על איזה מספר חשבתי?`,
      answer: { kind: 'number', value: x },
      hints: [
        'יש מספר לא ידוע. קוראים לו x ומתרגמים את הסיפור למשוואה.',
        '"כפלתי ב-..." הופך ל-x כפול מספר, "הוספתי" הופך ל-+, "קיבלתי" הופך ל-=. אחר כך פותרים כרגיל.',
        `המשוואה: ${m(`${a}x + ${b} = ${c}`)}`,
      ],
      solution: [`${m(`${a}x + ${b} = ${c}`)}`, `${m(`${a}x = ${c - b}`)}`, `${m(`x = ${x}`)}`],
      mistakes: mistakes(isNum(x), [numMistake((c + b) / a, `הוספת את ${m(b)} במקום להחסיר.`), numMistake(c - b, `שכחת לחלק ב-${m(a)}.`)]),
    };
  }
  if (level === 2) {
    const x = int(rng, 3, 30);
    const k = int(rng, 2, 5);
    const T = x * (k + 1);
    const [p1, p2] = pick(rng, [
      ['לנועה', 'לאיתי'],
      ['למאיה', 'לעומר'],
      ['לשירה', 'ליונתן'],
    ]);
    return {
      subtopicId: id,
      level,
      prompt: `${p1} יש פי ${m(k)} יותר מדבקות מאשר ${p2}. ביחד יש להם ${m(T)} מדבקות. כמה מדבקות יש ${p2}?`,
      answer: { kind: 'number', value: x, unit: 'מדבקות' },
      hints: [
        'שני מספרים לא ידועים, אבל אחד נקבע לפי השני. מסמנים ב-x את הקטן יותר.',
        `אם ${p2} יש x, אז ${p1} יש ${m(`${k}x`)}. "ביחד" זה חיבור, ומקבלים משוואה.`,
        `המשוואה: ${m(`x + ${k}x = ${T}`)}`,
      ],
      solution: [`${m(`x + ${k}x = ${T}`)}`, `${m(`${k + 1}x = ${T}`)}`, `${m(`x = ${x}`)}`],
      mistakes: mistakes(isNum(x), [numMistake(T / k, `חילקת ב-${m(k)}. אבל ביחד יש x ועוד ${m(`${k}x`)}, כלומר ${m(`${k + 1}x`)}.`), numMistake(T / 2, 'חילקת שווה בשווה, אבל לאחד יש יותר.'), numMistake(k * x, `זה כמה יש ${p1}. השאלה היא על ${p2}.`)]),
    };
  }
  const w = int(rng, 2, 20);
  const d = int(rng, 1, 10);
  const P = 2 * (w + w + d);
  return {
    subtopicId: id,
    level,
    prompt: `אורך של מלבן גדול ב-${m(d)} ס"מ מהרוחב שלו. ההיקף של המלבן הוא ${m(P)} ס"מ. מה הרוחב?`,
    answer: { kind: 'number', value: w, unit: 'ס"מ' },
    hints: [
      'לא יודעים את הרוחב ולא את האורך, אבל יודעים את הקשר ביניהם ואת ההיקף.',
      'מסמנים את הרוחב ב-x, וכותבים את האורך בעזרת x. היקף = 2 × (אורך + רוחב). כך מקבלים משוואה.',
      `רוחב x, אורך ${m(`x + ${d}`)}. המשוואה: ${m(`2(x + x + ${d}) = ${P}`)}`,
    ],
    solution: [`${m(`2(2x + ${d}) = ${P}`)}`, `${m(`4x + ${2 * d} = ${P}`)}`, `${m(`4x = ${P - 2 * d}`)}`, `${m(`x = ${w}`)}`],
    mistakes: mistakes(isNum(w), [numMistake(P / 4, 'חילקת את ההיקף ב-4 כאילו זה ריבוע. אבל האורך והרוחב שונים.'), numMistake(w + d, 'זה האורך. השאלה שואלת על הרוחב.')]),
  };
}

export const equationsUnit: UnitContent = {
  hook: {
    title: 'מאזניים',
    text: 'משוואה היא מאזניים מאוזנים. אם מורידים 5 מצד אחד, חייבים להוריד 5 גם מהצד השני, אחרת המאזניים נופלים. כל פתרון של משוואה הוא בעצם שמירה על איזון, עד ש-x נשאר לבד.',
  },
  tricks: [
    'מה שעושים לאגף אחד, עושים לשני.',
    'קודם מבטלים חיבור וחיסור, אחר כך כפל וחילוק.',
    'סוף טוב: מציבים את הפתרון במשוואה ובודקים שיוצא שוויון נכון.',
    'אם x נעלם: שוויון נכון אומר שכל מספר פתרון, שוויון שקרי אומר שאין פתרון.',
  ],
  commonMistakes: [
    { title: 'סימן שגוי בהעברה', text: 'ב-{{3x + 5 = 20}} מחסירים 5 (ולא מוסיפים): {{3x = 15}}.' },
    { title: 'סוגריים חלקיים', text: '{{3(x + 2)}} זה {{3x + 6}}, לא {{3x + 2}}. המספר כופל את כל מה שבסוגריים.' },
    { title: 'לשכוח את הצעד האחרון', text: 'הגעת ל-{{4x = 20}}? עוד לא סיימת: {{x = 5}}.' },
  ],
  subtopics: [
    {
      id: 'equations.basic',
      title: 'משוואות בצעד אחד ושני צעדים',
      addedIn: V,
      generate: basic,
      explanations: [
        {
          label: 'מאזניים',
          title: 'משוואה = מאזניים',
          interactive: 'balance',
          paragraphs: [
            'שני האגפים שווים, כמו שתי כפות של מאזניים מאוזנים.',
            'כדי למצוא את x, עושים פעולות שמבודדות אותו, **תמיד לשני האגפים**.',
            'שחקי בהדמיה: ראי איך {{3x + 5 = 20}} הופך שלב אחרי שלב ל-{{x = 5}}.',
          ],
        },
        {
          label: 'הפוך',
          title: 'לעבוד אחורה',
          paragraphs: [
            'על x עשו פעולות: ב-{{3x + 5}} קודם כפלו ב-3 ואז הוסיפו 5.',
            'כדי לחזור ל-x הולכים אחורה, בסדר הפוך ובפעולות הפוכות: קודם מחסירים 5, ואז מחלקים ב-3.',
          ],
          example: { question: '{{4x − 7 = 21}}', steps: ['מוסיפים 7: {{4x = 28}}', 'מחלקים ב-4: {{x = 7}}', 'בדיקה: {{4 × 7 − 7 = 21}} ✓'] },
        },
      ],
    },
    {
      id: 'equations.both-sides',
      title: 'נעלם בשני האגפים וסוגריים',
      addedIn: V,
      generate: bothSides,
      explanations: [
        {
          label: 'לאסוף',
          title: 'לאסוף את ה-x לצד אחד',
          paragraphs: ['כשיש x בשני האגפים, מעבירים את כולם לצד אחד: בדרך כלל לצד שבו יש יותר x, כדי להימנע ממינוסים.', 'המספרים עוברים לצד השני.'],
          example: { question: '{{5x + 3 = 2x + 15}}', steps: ['מחסירים {{2x}}: {{3x + 3 = 15}}', 'מחסירים 3: {{3x = 12}}', '{{x = 4}}'] },
        },
        {
          label: 'סוגריים',
          title: 'חוק הפילוג',
          paragraphs: ['המספר שלפני הסוגריים כופל **כל** איבר בתוכם: {{3(x + 4) = 3x + 12}}.', 'אחרי שפותחים סוגריים, זו משוואה רגילה.'],
          example: { question: '{{2(x − 3) = 10}}', steps: ['{{2x − 6 = 10}}', '{{2x = 16}}', '{{x = 8}}'] },
        },
      ],
    },
    {
      id: 'equations.fractions',
      title: 'משוואות עם שברים',
      addedIn: V,
      generate: fractions,
      explanations: [
        {
          label: 'להיפטר',
          title: 'להיפטר מהמכנה',
          paragraphs: ['שברים במשוואה זה מסורבל. כופלים את **כל** המשוואה במכנה, והשבר נעלם.', 'אם יש כמה מכנים, כופלים במכנה המשותף.'],
          example: { question: '{{x/3 + x/6 = 5}}', steps: ['כופלים ב-6: {{2x + x = 30}}', '{{3x = 30}}', '{{x = 10}}'] },
        },
        {
          label: 'מונה שלם',
          title: 'כשהמונה הוא ביטוי',
          paragraphs: ['ב-{{(x + 4)/3 = 5}}, כל ה-{{x + 4}} מחולק ב-3, כאילו יש סביבו סוגריים.', 'כופלים ב-3: {{x + 4 = 15}}, ולכן {{x = 11}}.'],
        },
      ],
    },
    {
      id: 'equations.special',
      title: 'משוואות מיוחדות',
      addedIn: V,
      generate: special,
      explanations: [
        {
          label: 'x נעלם',
          title: 'כשה-x נעלם',
          paragraphs: [
            'לפעמים, אחרי שמעבירים, ה-x מתבטל לגמרי.',
            '**{{3 = 3}}** (נכון): כל מספר הוא פתרון. למשל {{2(x + 1) = 2x + 2}}.',
            '**{{3 = 5}}** (שקר): אין פתרון. למשל {{x + 3 = x + 5}}, כי שום מספר ועוד 3 לא שווה לאותו מספר ועוד 5.',
          ],
        },
        {
          label: 'קיצור',
          title: 'בדיקה מהירה',
          paragraphs: ['אחרי פתיחת סוגריים, משווים את שני האגפים:', 'מקדמי x שונים: פתרון אחד.', 'מקדמים שווים ומספרים שווים: כל מספר הוא פתרון.', 'מקדמים שווים ומספרים שונים: אין פתרון.'],
        },
      ],
    },
    {
      id: 'equations.word',
      title: 'שאלות מילוליות',
      addedIn: V,
      generate: word,
      explanations: [
        {
          label: 'מילון',
          title: 'לתרגם עברית למתמטיקה',
          paragraphs: ['"מספר לא ידוע" ← x', '"פי 3" ← {{3x}}', '"גדול ב-5" ← {{x + 5}}', '"ביחד" ← חיבור, "קיבלתי" ← =', 'אחרי התרגום פותרים משוואה רגילה.'],
        },
        {
          label: 'שלבים',
          title: 'ארבעה שלבים',
          paragraphs: ['1. מה לא ידוע? מסמנים ב-x (בדרך כלל את הקטן).', '2. כותבים את שאר הגדלים בעזרת x.', '3. בונים משוואה מהמשפט שיש בו מספר.', '4. פותרים ובודקים שהתשובה הגיונית בסיפור.'],
        },
      ],
    },
  ],
};
