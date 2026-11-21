import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, coprimeTuple, gcd, gcdAll, shuffle, type Rng } from '../../lib/random';
import { m, r, isNum, mistakes, numMistake, ratioMistake } from '../helpers';

const V = '0.1.0';

/** Smallest factor > 1 — a friendly first step for simplifying in stages. */
function smallestFactor(n: number): number {
  for (let f = 2; f <= n; f++) if (n % f === 0) return f;
  return n;
}

// ---------- ratio-equiv.expand ----------
function expand(level: Level, rng: Rng): Exercise {
  const id = 'ratio-equiv.expand';
  const [a, b] = coprimeTuple(rng, 2, 1, 9);
  const k = int(rng, 2, level === 1 ? 5 : 12);
  if (level === 1) {
    return {
      subtopicId: id,
      level,
      prompt: `הרחיבי את היחס ${r(a, b)} פי ${m(k)}.`,
      answer: { kind: 'ratio', parts: [a * k, b * k], acceptEquivalent: false },
      hints: [
        'להרחיב יחס זה לכתוב יחס **שווה** לו, עם מספרים גדולים יותר. כמו להגדיל מתכון.',
        'כדי שהיחס יישאר אותו יחס, מכפילים את **כל** המספרים באותו מספר. אם מוסיפים, היחס משתנה.',
        `התחילי מהמספר הראשון: ${m(`${a} × ${k}`)}`,
      ],
      solution: [`${m(`${a} × ${k} = ${a * k}`)}`, `${m(`${b} × ${k} = ${b * k}`)}`, `היחס המורחב: ${r(a * k, b * k)}.`],
      mistakes: [ratioMistake([a + k, b + k], 'הוספת את המספר לכל צד. להרחיב יחס זה **להכפיל**, לא לחבר.')],
    };
  }
  if (level === 2) {
    const ans = a * k;
    return {
      subtopicId: id,
      level,
      prompt: `מצאי את המספר החסר: ${m(`${a}:${b} = ?:${b * k}`)}`,
      answer: { kind: 'number', value: ans },
      hints: [
        'שני היחסים שווים, ובאחד מהם חסר מספר. צריך למצוא אותו כך שהשוויון יישמר.',
        'מחפשים זוג מספרים שמופיעים בשני הצדדים, ובודקים **פי כמה** השתנה. את המספר החסר משנים פי אותו מספר.',
        `פי כמה ${m(b)} הפך ל-${m(b * k)}? חשבי ${m(`${b * k} ÷ ${b}`)}`,
      ],
      solution: [`${m(b)} הוכפל פי ${m(k)}.`, `לכן: ${m(`${a} × ${k} = ${ans}`)}.`],
      mistakes: mistakes(isNum(ans), [
        numMistake(a + (b * k - b), `הוספת ל-${m(a)} את אותו הפרש. ביחסים שווים מכפילים, לא מחברים.`),
      ]),
    };
  }
  // level 3: which ratio is equal?
  const kk = int(rng, 2, 6);
  const correct = r(a * kk, b * kk);
  const options = shuffle(rng, [correct, r(a + kk, b + kk), r(b * kk, a * kk), r(a * kk, b + kk)]);
  // Guard against accidental duplicates (e.g. a+kk == a*kk).
  const unique = Array.from(new Set(options));
  return {
    subtopicId: id,
    level,
    prompt: `איזה יחס שווה ליחס ${r(a, b)}?`,
    answer: { kind: 'choice', options: unique, correct: unique.indexOf(correct) },
    hints: [
      'מחפשים את התשובה שהיא **אותו יחס** בגודל אחר. בשאר התשובות יש מלכודת.',
      'יחס שווה נוצר רק מכפל של שני הצדדים באותו מספר, ובאותו סדר. פסלי תשובות שבהן חיברו מספר, הפכו את הסדר או הכפילו רק צד אחד.',
      `בכל תשובה, חלקי את המספר הראשון ב-${m(a)} ואת השני ב-${m(b)}. בתשובה הנכונה יוצאת אותה תוצאה בשניהם.`,
    ],
    solution: [`${correct}: הכפלנו את ${m(a)} ואת ${m(b)} פי ${m(kk)}.`, 'בתשובות האחרות חיברו מספר, הפכו את הסדר או הכפילו רק צד אחד.'],
    mistakes: [],
  };
}

// ---------- ratio-equiv.simplify ----------
function simplify(level: Level, rng: Rng): Exercise {
  const id = 'ratio-equiv.simplify';
  if (level === 3) {
    const base = coprimeTuple(rng, 3, 1, 7);
    const g = pick(rng, [2, 3, 4, 5, 6]);
    const big = base.map((x) => x * g);
    return {
      subtopicId: id,
      level,
      prompt: `צמצמי עד הסוף את היחס ${r(...big)}.`,
      answer: { kind: 'ratio', parts: base, requireSimplest: true },
      hints: [
        'צריך לכתוב את אותו יחס עם המספרים הכי קטנים שאפשר.',
        'מחפשים מספר שמחלק את **שלושת** המספרים ביחד, ומחלקים בו את כולם. ממשיכים עד שאין יותר מחלק משותף לשלושתם.',
        `נסי לחלק את שלושת המספרים ב-${m(smallestFactor(g))}, ואז בדקי אם אפשר להמשיך.`,
      ],
      solution: [`המחלק המשותף הגדול ביותר: ${m(g)}.`, `${big.map((x) => m(`${x} ÷ ${g} = ${x / g}`)).join(' , ')}`, `${r(...base)}`],
      mistakes: [],
    };
  }
  const [a, b] = coprimeTuple(rng, 2, 1, level === 1 ? 7 : 11);
  const g = level === 1 ? pick(rng, [2, 3, 5]) : pick(rng, [4, 6, 8, 9, 12, 15]);
  const A = a * g;
  const B = b * g;
  return {
    subtopicId: id,
    level,
    prompt: `צמצמי עד הסוף את היחס ${r(A, B)}.`,
    answer: { kind: 'ratio', parts: [a, b], requireSimplest: true },
    hints: [
      'צריך לכתוב את אותו יחס עם המספרים הכי קטנים שאפשר. זה "זום־אאוט" על היחס.',
      'מחפשים מספר שמחלק את שני המספרים, ומחלקים בו את שניהם. לא חייבים למצוא מיד את הגדול ביותר: אפשר לצמצם בכמה שלבים, עד שאין יותר מחלק משותף.',
      level === 1
        ? `שני המספרים מתחלקים ב-${m(g)}.`
        : `נסי להתחיל בחילוק של שניהם ב-${m(smallestFactor(g))}, ואז בדקי אם אפשר להמשיך.`,
    ],
    solution: [`המחלק המשותף הגדול ביותר של ${m(A)} ו-${m(B)} הוא ${m(g)}.`, `${m(`${A} ÷ ${g} = ${a}`)}, ${m(`${B} ÷ ${g} = ${b}`)}`, `היחס המצומצם: ${r(a, b)}.`],
    mistakes: [],
  };
}

// ---------- ratio-equiv.fractions ----------
function fractions(level: Level, rng: Rng): Exercise {
  const id = 'ratio-equiv.fractions';
  if (level === 1) {
    // Decimals with one digit after the point.
    let a: number, b: number, mul: number;
    do {
      [a, b] = coprimeTuple(rng, 2, 1, 9);
      mul = int(rng, 1, 9);
    } while ((a * mul) % 10 === 0 && (b * mul) % 10 === 0);
    const A = (a * mul) / 10;
    const B = (b * mul) / 10;
    return {
      subtopicId: id,
      level,
      prompt: `כתבי כיחס מצומצם של מספרים שלמים: ${r(A, B)}`,
      answer: { kind: 'ratio', parts: [a, b], requireSimplest: true },
      hints: [
        'צריך לכתוב את אותו יחס בלי נקודה עשרונית, במספרים שלמים ובצורה מצומצמת.',
        'כפל של שני הצדדים באותו מספר לא משנה את היחס. אז אפשר להכפיל את שניהם ב-10 כדי להיפטר מהנקודה, ורק אחר כך לצמצם.',
        `התחילי ב: ${m(`${A} × 10`)} ו-${m(`${B} × 10`)}`,
      ],
      solution:
        mul === 1
          ? [`כפול 10: ${r(a, b)}. אין מה לצמצם.`]
          : [`כפול 10: ${r(a * mul, b * mul)}.`, `מצמצמים ב-${m(gcd(a * mul, b * mul))}: ${r(a, b)}.`],
      mistakes: [],
    };
  }
  if (level === 2) {
    // 1/p : 1/q
    let p: number, q: number;
    do {
      p = int(rng, 2, 8);
      q = int(rng, 2, 8);
    } while (p === q);
    const L = (p * q) / gcd(p, q);
    const ans = [L / p, L / q];
    const g = gcdAll(ans);
    const simp = ans.map((x) => x / g);
    return {
      subtopicId: id,
      level,
      prompt: `כתבי כיחס מצומצם של מספרים שלמים: ${m(`1/${p} : 1/${q}`)}`,
      answer: { kind: 'ratio', parts: simp, requireSimplest: true },
      hints: [
        'יחס בין שני שברים. צריך לכתוב אותו במספרים שלמים.',
        'מכפילים את שני השברים **באותו** מספר, כזה שמתחלק בשני המכנים. כך השברים נעלמים, והיחס נשאר אותו יחס.',
        `מספר שמתחלק ב-${m(p)} וגם ב-${m(q)}: ${m(L)}. כמה זה ${m(`1/${p} × ${L}`)}?`,
      ],
      solution: [`מכנה משותף: ${m(L)}.`, `${m(`1/${p} × ${L} = ${L / p}`)} , ${m(`1/${q} × ${L} = ${L / q}`)}`, `היחס: ${r(...simp)}.`],
      mistakes: [ratioMistake([p, q], `שימי לב: ${m(`1/${p}`)} ${p < q ? 'גדול' : 'קטן'} מ-${m(`1/${q}`)}, אז המספר הראשון ביחס צריך להיות ${p < q ? 'גדול' : 'קטן'} יותר. כתבת את המכנים במקום את השברים.`)],
    };
  }
  // a/b : c/d
  const fr = () => {
    const d = int(rng, 2, 9);
    let n = int(rng, 1, d - 1);
    while (gcd(n, d) !== 1) n = int(rng, 1, d - 1);
    return [n, d];
  };
  let [n1, d1] = fr();
  let [n2, d2] = fr();
  while (n1 * d2 === n2 * d1) [n2, d2] = fr();
  const raw = [n1 * d2, n2 * d1];
  const g = gcdAll(raw);
  const simp = raw.map((x) => x / g);
  return {
    subtopicId: id,
    level,
    prompt: `כתבי כיחס מצומצם של מספרים שלמים: ${m(`${n1}/${d1} : ${n2}/${d2}`)}`,
    answer: { kind: 'ratio', parts: simp, requireSimplest: true },
    hints: [
      'יחס בין שני שברים. צריך לכתוב אותו במספרים שלמים, ובצורה מצומצמת.',
      'מכפילים את שני השברים באותו מספר, כזה שמתחלק בשני המכנים. השברים נעלמים, היחס לא משתנה, ובסוף מצמצמים.',
      `נסי להכפיל את שני השברים ב-${m(d1 * d2)} (מכפלת המכנים).`,
    ],
    solution: [`כפול ${m(d1 * d2)}: ${r(...raw)}.`, `מצמצמים: ${r(...simp)}.`],
    mistakes: [],
  };
}

// ---------- ratio-equiv.add-mult ----------
function addMult(level: Level, rng: Rng): Exercise {
  const id = 'ratio-equiv.add-mult';
  if (level === 1) {
    const [a, b] = coprimeTuple(rng, 2, 1, 9);
    const k = int(rng, 2, 5);
    const isMult = rng() < 0.5;
    const text = isMult ? `הכפילו את שני המספרים ב-${m(k)}` : `הוסיפו ${m(k)} לשני המספרים`;
    return {
      subtopicId: id,
      level,
      prompt: `ביחס ${r(a, b)} ${text}. האם קיבלנו יחס שווה ליחס המקורי?`,
      answer: { kind: 'choice', options: ['כן, היחס שווה', 'לא, היחס השתנה'], correct: isMult ? 0 : 1 },
      hints: [
        'שואלים אם הפעולה שומרת על היחס, או שהיחס החדש כבר שונה.',
        'דרך לבדוק: מחשבים את היחס החדש ומנסים לצמצם אותו. אם חוזרים בדיוק ליחס המקורי, היחס נשמר.',
        `היחס החדש הוא ${isMult ? r(a * k, b * k) : r(a + k, b + k)}. אפשר לצמצם אותו ל-${r(a, b)}?`,
      ],
      solution: isMult
        ? [`${r(a * k, b * k)}: מצמצמים ב-${m(k)} ומקבלים ${r(a, b)}. היחס שווה.`]
        : [`${r(a + k, b + k)} לא מצטמצם ל-${r(a, b)}.`, 'חיבור אותו מספר לשני הצדדים **משנה** את היחס.'],
      mistakes: [],
    };
  }
  if (level === 2) {
    const [a, b] = coprimeTuple(rng, 2, 1, 6);
    const k = int(rng, 2, 6);
    const add = int(rng, 1, 5);
    const boys = a * k + add;
    const girls = b * k + add;
    const g = gcd(boys, girls);
    const ans = [boys / g, girls / g];
    return {
      subtopicId: id,
      level,
      prompt: `בחוג היחס בין בנים לבנות הוא ${r(a, b)}, ויש בו ${m(a * k)} בנים. הצטרפו לחוג עוד ${m(add)} בנים ועוד ${m(add)} בנות. מה היחס החדש בין בנים לבנות? (צמצמי עד הסוף)`,
      answer: { kind: 'ratio', parts: ans, requireSimplest: true },
      hints: [
        'שואלים על היחס **אחרי** שהצטרפו ילדים, לא על היחס המקורי.',
        'אי אפשר להוסיף ילדים ישר ליחס. סדר העבודה: (1) מוצאים כמה בנים ובנות היו באמת, (2) מוסיפים לכל קבוצה, (3) כותבים יחס חדש ומצמצמים.',
        `${m(a * k)} בנים זה פי ${m(k)} מ-${m(a)} שביחס. אז כמה בנות היו?`,
      ],
      solution: [`בנות לפני: ${m(`${b} × ${k} = ${b * k}`)}.`, `אחרי: בנים ${m(boys)}, בנות ${m(girls)}.`, `היחס: ${r(boys, girls)}${g > 1 ? ` = ${r(...ans)}` : ''}.`],
      mistakes: [ratioMistake([a, b], 'הוספת אותו מספר לשני הצדדים **משנה** את היחס. צריך לחשב את הכמויות החדשות.')],
    };
  }
  // level 3: how many to add to reach a new ratio
  const [t1, t2] = coprimeTuple(rng, 2, 1, 5);
  const k = int(rng, 2, 6);
  const red = t1 * k;
  const blueFinal = t2 * k;
  const add = int(rng, 1, Math.max(1, blueFinal - 1));
  const blue = blueFinal - add;
  return {
    subtopicId: id,
    level,
    prompt: `בקופסה ${m(red)} כדורים אדומים ו-${m(blue)} כדורים כחולים. כמה כדורים כחולים צריך להוסיף כדי שהיחס אדומים:כחולים יהיה ${r(t1, t2)}?`,
    answer: { kind: 'number', value: add },
    hints: [
      'שואלים כמה כחולים **להוסיף**, לא כמה כחולים יהיו בסוף.',
      'את האדומים לא משנים, ולכן הם המפתח. מהם מבינים כמה כחולים צריכים להיות בסוף לפי היחס החדש, ואז מחסירים את מה שכבר יש.',
      `${m(red)} אדומים זה פי כמה מ-${m(t1)} שביחס החדש?`,
    ],
    solution: [`${m(red)} אדומים = פי ${m(k)} מ-${m(t1)}.`, `בסוף צריכים להיות ${m(`${t2} × ${k} = ${blueFinal}`)} כחולים.`, `להוסיף: ${m(`${blueFinal} − ${blue} = ${add}`)}.`],
    mistakes: mistakes(isNum(add), [
      numMistake(blueFinal, `${m(blueFinal)} זה מספר הכחולים שצריכים להיות **בסוף**. השאלה היא כמה **להוסיף**.`),
    ]),
  };
}

export const ratioEquivUnit: UnitContent = {
  hook: {
    title: 'זום על יחס',
    text: 'כשמגדילים תמונה בטלפון עם שתי אצבעות, הכול גדל באותה מידה והתמונה לא מתעוותת. הרחבה וצמצום של יחס הם בדיוק "זום": המספרים משתנים, הצורה נשארת.',
  },
  tricks: [
    'מה שעושים לצד אחד, עושים לשני.',
    'מרחיבים בכפל, מצמצמים בחילוק. אף פעם לא בחיבור או בחיסור.',
    'יש נקודה עשרונית או שבר ביחס? הכפילי את כל הצדדים עד שהכול שלם, ואז צמצמי.',
  ],
  commonMistakes: [
    { title: 'לחבר במקום להכפיל', text: '{{2:3}} פלוס 1 לכל צד נותן {{3:4}}, וזה יחס אחר לגמרי.' },
    { title: 'לעצור באמצע הצמצום', text: '{{12:18}} מתחלק ב-2 ל-{{6:9}}, אבל אפשר להמשיך ולחלק ב-3: {{2:3}}. בודקים תמיד אם נשאר מחלק משותף.' },
    { title: 'לכתוב מכנים במקום שברים', text: '{{1/2 : 1/3}} הוא לא {{2:3}}. חצי גדול משליש, לכן היחס הוא {{3:2}}.' },
  ],
  subtopics: [
    {
      id: 'ratio-equiv.expand',
      title: 'הרחבת יחס',
      addedIn: V,
      generate: expand,
      explanations: [
        {
          label: 'זום',
          title: 'להרחיב = לעשות זום־אין',
          interactive: 'zoom',
          paragraphs: [
            'כשמרחיבים יחס, **מכפילים את כל המספרים באותו מספר**.',
            '{{2:3}} פי 4 זה {{8:12}}. זה אותו יחס בגודל אחר.',
            'שחקי בהדמיה: המלבנים גדלים, אבל הפרופורציה ביניהם לא משתנה.',
          ],
        },
        {
          label: 'מספר חסר',
          title: 'למצוא מספר חסר',
          paragraphs: ['ב-{{3:5 = ?:20}} שואלים: "פי כמה {{5}} הפך ל-{{20}}?"', 'פי 4. לכן גם {{3}} גדל פי 4 והופך ל-{{12}}.'],
          example: { question: '{{4:7 = ?:35}}', steps: ['{{35 ÷ 7 = 5}}', '{{4 × 5 = 20}}', 'התשובה: 20'] },
        },
      ],
    },
    {
      id: 'ratio-equiv.simplify',
      title: 'יחס מצומצם',
      addedIn: V,
      generate: simplify,
      explanations: [
        {
          label: 'זום־אאוט',
          title: 'לצמצם = לעשות זום־אאוט',
          interactive: 'zoom',
          paragraphs: [
            'מחלקים את כל המספרים ביחס באותו מספר, עד שאין להם יותר מחלק משותף.',
            '{{18:24}}: שניהם מתחלקים ב-6, ומקבלים {{3:4}}.',
            'יחס מצומצם הוא "הגרסה הכי קטנה" של היחס, כמו מתכון למנה אחת.',
          ],
        },
        {
          label: 'בשלבים',
          title: 'לא מוצאת את המחלק הגדול? בשלבים',
          paragraphs: ['לא חייבים למצוא מיד את המחלק הגדול ביותר. אפשר לצמצם בכמה שלבים קטנים.'],
          example: { question: 'צמצמי {{36:48}}', steps: ['חילוק ב-2: {{18:24}}', 'שוב ב-2: {{9:12}}', 'ב-3: {{3:4}}', 'ל-3 ול-4 אין מחלק משותף, אז סיימנו.'] },
        },
      ],
    },
    {
      id: 'ratio-equiv.fractions',
      title: 'יחס עם שברים ועשרוניים',
      addedIn: V,
      generate: fractions,
      explanations: [
        {
          label: 'כסף',
          title: 'עשרוניים: לחשוב באגורות',
          paragraphs: [
            '{{1.5:2}} זה כמו 1.5 שקל מול 2 שקלים.',
            'באגורות: 150 מול 200. כלומר מכפילים ב-100, או בקיצור ב-10: {{15:20}}.',
            'ואז מצמצמים ל-{{3:4}}.',
          ],
        },
        {
          label: 'מכנה משותף',
          title: 'שברים: להכפיל במכנה משותף',
          paragraphs: ['ביחס של שברים מכפילים את שני הצדדים במכנה משותף, וכך השברים נעלמים.'],
          example: { question: '{{2/3 : 3/4}}', steps: ['מכנה משותף: 12.', '{{2/3 × 12 = 8}}, {{3/4 × 12 = 9}}', 'היחס: {{8:9}}'] },
        },
      ],
    },
    {
      id: 'ratio-equiv.add-mult',
      title: 'יחס: הוספה והכפלה',
      addedIn: V,
      generate: addMult,
      explanations: [
        {
          label: 'גילאים',
          title: 'למה הוספה משנה יחס?',
          paragraphs: [
            'נועה בת 2 ואחיה בן 4. היחס בין הגילאים הוא {{1:2}}: הוא כפול ממנה.',
            'אחרי 10 שנים היא בת 12 והוא בן 14. היחס הוא {{6:7}}, והוא כבר ממש לא כפול ממנה.',
            'הוספה של אותו מספר לשני הצדדים **משנה** את היחס. כפל באותו מספר **שומר** עליו.',
          ],
        },
        {
          label: 'שיטה',
          title: 'שיטה לשאלות "הצטרפו"',
          paragraphs: ['1. מוצאים את הכמויות **האמיתיות** לפני השינוי.', '2. מוסיפים או מורידים לכל כמות.', '3. כותבים יחס חדש ומצמצמים.'],
        },
      ],
    },
  ],
};
