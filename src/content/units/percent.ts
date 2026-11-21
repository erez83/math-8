import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, gcd, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake } from '../helpers';
import { fmt } from '../../lib/answer';

const V = '0.3.0';

/** A number N such that p% of N is a whole number. */
function niceWhole(rng: Rng, p: number, maxMult = 12): number {
  const step = 100 / gcd(p, 100);
  return step * int(rng, 1, Math.max(1, Math.floor((maxMult * 20) / step)));
}

// ---------- percent.of ----------
function of(level: Level, rng: Rng): Exercise {
  const id = 'percent.of';
  const p = level === 1 ? pick(rng, [10, 20, 25, 50, 75]) : level === 2 ? pick(rng, [5, 15, 30, 35, 40, 45, 60, 65, 80, 90]) : pick(rng, [12, 18, 36, 64, 110, 120, 150, 125]);
  const N = niceWhole(rng, p, level === 3 ? 20 : 10);
  const ans = (p * N) / 100;
  const ctx = level === 3 ? `בבית הספר יש ${m(N)} תלמידים, ו-${m(p + '%')} מהם משתתפים בחוג. כמה תלמידים משתתפים בחוג?` : `כמה זה ${m(p + '%')} מ-${m(N)}?`;
  const prompt = level === 3 && p > 100 ? `מחיר של ${m(N)} ש"ח עלה, והמחיר החדש הוא ${m(p + '%')} מהמחיר הקודם. מה המחיר החדש?` : ctx;
  return {
    subtopicId: id,
    level,
    prompt,
    answer: { kind: 'number', value: ans },
    hints: [
      `מחפשים חלק מתוך ${m(N)}. "אחוז" פירושו "מתוך 100", כלומר ${m(p + '%')} זה ${m(p)} חלקים מכל 100 חלקים.`,
      'הדרך הקלה: מוצאים 10% (מחלקים ב-10) או 1% (מחלקים ב-100), ומשם בונים את האחוז המבוקש בכפל וחיבור. דרך נוספת: מכפילים את המספר ב-p/100.',
      p % 10 === 0 || p === 25 || p === 75 ? `10% מ-${m(N)} = ${m(`${N} ÷ 10`)}. כמה פעמים 10% יש ב-${m(p + '%')}?` : `1% מ-${m(N)} = ${m(`${N} ÷ 100`)}. כפלי ב-${m(p)}.`,
    ],
    solution: [`1% = ${m(`${N} ÷ 100 = ${fmt(N / 100)}`)}`, `${m(`${p}% = ${fmt(N / 100)} × ${p} = ${fmt(ans)}`)}`],
    mistakes: mistakes(isNum(ans), [
      numMistake(N * p, 'שכחת לחלק ב-100. אחוז זה "מתוך 100".'),
      numMistake(N - ans, `זה מה שנשאר אחרי שמורידים ${m(p + '%')}. השאלה היא כמה זה ה-${m(p + '%')} עצמם.`),
    ]),
  };
}

// ---------- percent.what-percent ----------
function whatPercent(level: Level, rng: Rng): Exercise {
  const id = 'percent.what-percent';
  const N = level === 1 ? pick(rng, [10, 20, 25, 50]) : level === 2 ? pick(rng, [40, 80, 200, 250, 400, 500]) : pick(rng, [16, 24, 32, 40, 60, 120]);
  const step = 100 / gcd(N, 100);
  let p = step * int(rng, 1, Math.floor(99 / step));
  if (p >= 100 || p <= 0) p = step;
  const a = (p * N) / 100;
  const prompt =
    level === 3
      ? `בכיתה ${m(N)} תלמידים. ${m(a)} מהם מגיעים לבית הספר באופניים. איזה אחוז מהכיתה מגיע באופניים?`
      : `${m(a)} מתוך ${m(N)} זה כמה אחוזים?`;
  return {
    subtopicId: id,
    level,
    prompt,
    answer: { kind: 'number', value: p, unit: '%' },
    hints: [
      `שואלים איזה חלק ${m(a)} הוא מתוך ${m(N)}, כשהחלק כתוב באחוזים, כלומר "מתוך 100".`,
      'כותבים את החלק כשבר (חלק חלקי שלם), ואז הופכים אותו לשבר עם מכנה 100: מרחיבים אותו, או כופלים ב-100.',
      `השבר: ${m(`${a}/${N}`)}. ${100 % N === 0 ? `הרחיבי פי ${m(100 / N)} כדי לקבל מכנה 100.` : `כפלי ב-100: ${m(`${a} ÷ ${N} × 100`)}`}`,
    ],
    solution: [`${m(`${a}/${N}`)} = ${m(`${a} ÷ ${N} = ${fmt(a / N)}`)}`, `${m(`${fmt(a / N)} × 100 = ${p}%`)}`],
    mistakes: mistakes(isNum(p), [
      numMistake(a / N, 'זה השבר כמספר עשרוני. כדי לקבל אחוזים, כופלים ב-100.'),
      numMistake(a, `${m(a)} זה מספר התלמידים, לא האחוז. צריך לבדוק איזה חלק זה מכל ${m(N)}.`),
    ]),
  };
}

// ---------- percent.whole ----------
function whole(level: Level, rng: Rng): Exercise {
  const id = 'percent.whole';
  const p = level === 1 ? pick(rng, [10, 25, 50]) : level === 2 ? pick(rng, [20, 30, 40, 60, 75, 5]) : pick(rng, [15, 35, 12, 45, 80]);
  const N = niceWhole(rng, p, 15);
  const part = (p * N) / 100;
  const prompt =
    level === 3
      ? `שילמתי מקדמה של ${m(p + '%')} מהמחיר של אופניים, והמקדמה היא ${m(part)} ש"ח. מה המחיר המלא?`
      : `${m(p + '%')} ממספר מסוים הם ${m(part)}. מה המספר?`;
  return {
    subtopicId: id,
    level,
    prompt,
    answer: { kind: 'number', value: N },
    hints: [
      `הפעם יודעים את **החלק** (${m(part)}) ואת האחוז שלו, ומחפשים את **השלם**, כלומר 100%. התשובה תהיה גדולה מ-${m(part)}.`,
      'הולכים מהאחוז הידוע ל-1% (או ל-10%), ומשם ל-100%. דרך נוספת: פרופורציה בין אחוזים לכמויות.',
      `אם ${m(p + '%')} זה ${m(part)}, אז 1% זה ${m(`${part} ÷ ${p}`)}. כמה זה 100%?`,
    ],
    solution: [`1% = ${m(`${part} ÷ ${p} = ${fmt(part / p)}`)}`, `100% = ${m(`${fmt(part / p)} × 100 = ${N}`)}`],
    mistakes: mistakes(isNum(N), [
      numMistake((part * p) / 100, `חישבת ${m(p + '%')} **מ-**${m(part)}. אבל ${m(part)} הוא כבר החלק, ומחפשים את השלם.`),
      numMistake(part + p, 'חיברת את האחוז למספר. צריך למצוא כמה שווה 1%, ומשם 100%.'),
    ]),
  };
}

// ---------- percent.change ----------
function change(level: Level, rng: Rng): Exercise {
  const id = 'percent.change';
  if (level === 1) {
    const p = pick(rng, [10, 20, 25, 50, 30]);
    const P = niceWhole(rng, p, 10);
    const ans = P - (P * p) / 100;
    return {
      subtopicId: id,
      level,
      prompt: `חולצה עלתה ${m(P)} ש"ח, ובמבצע הוזלה ב-${m(p + '%')}. מה המחיר החדש?`,
      answer: { kind: 'number', value: ans, unit: 'ש"ח' },
      hints: [
        'שואלים על המחיר **אחרי** ההנחה, לא על גובה ההנחה.',
        `שתי דרכים: (1) מחשבים כמה זה ${m(p + '%')} ומורידים מהמחיר. (2) אחרי הנחה של ${m(p + '%')} משלמים ${m(100 - p + '%')} מהמחיר, ומחשבים את זה ישר.`,
        `ההנחה: ${m(p + '%')} מ-${m(P)} = ${m(`${P} ÷ 100 × ${p}`)}`,
      ],
      solution: [`ההנחה: ${m(`${fmt((P * p) / 100)}`)} ש"ח.`, `המחיר: ${m(`${P} − ${fmt((P * p) / 100)} = ${fmt(ans)}`)} ש"ח.`],
      mistakes: mistakes(isNum(ans), [numMistake((P * p) / 100, 'זה גובה ההנחה. צריך להוריד אותה מהמחיר המקורי.'), numMistake(P - p, `הורדת ${m(p)} שקלים במקום ${m(p + '%')}.`)]),
    };
  }
  if (level === 2) {
    const up = rng() < 0.5;
    const p = pick(rng, [10, 20, 25, 40, 15, 5]);
    const P = niceWhole(rng, p, 12);
    const newP = up ? P + (P * p) / 100 : P - (P * p) / 100;
    const findOriginal = rng() < 0.5;
    if (findOriginal) {
      return {
        subtopicId: id,
        level,
        prompt: `אחרי ${up ? 'התייקרות' : 'הנחה'} של ${m(p + '%')}, מחיר של מוצר הוא ${m(fmt(newP))} ש"ח. מה היה המחיר **לפני** ה${up ? 'התייקרות' : 'הנחה'}?`,
        answer: { kind: 'number', value: P, unit: 'ש"ח' },
        hints: [
          'מחפשים את המחיר המקורי. הוא ה-100%, וממנו חישבו את השינוי.',
          `המחיר החדש הוא ${m((up ? 100 + p : 100 - p) + '%')} מהמקורי. אז נתון כמה שווים ${m((up ? 100 + p : 100 - p) + '%')}, ומחפשים 100%.`,
          `1% = ${m(`${fmt(newP)} ÷ ${up ? 100 + p : 100 - p}`)}. כמה זה 100%?`,
        ],
        solution: [`${m(fmt(newP))} = ${m((up ? 100 + p : 100 - p) + '%')} מהמקורי.`, `1% = ${m(fmt(newP / (up ? 100 + p : 100 - p)))}, 100% = ${m(P)}.`],
        mistakes: mistakes(isNum(P), [
          numMistake(up ? newP - (newP * p) / 100 : newP + (newP * p) / 100, `חישבת ${m(p + '%')} מהמחיר **החדש**. אבל האחוזים חושבו מהמחיר המקורי, ולכן זה לא מחזיר אחורה בדיוק.`),
        ]),
      };
    }
    return {
      subtopicId: id,
      level,
      prompt: `מחיר של ${m(P)} ש"ח ${up ? 'התייקר' : 'הוזל'} ב-${m(p + '%')}. מה המחיר החדש?`,
      answer: { kind: 'number', value: newP, unit: 'ש"ח' },
      hints: [
        `שואלים על המחיר אחרי ה${up ? 'התייקרות' : 'הוזלה'}.`,
        `${up ? 'התייקרות' : 'הוזלה'} של ${m(p + '%')} = המחיר החדש הוא ${m((up ? 100 + p : 100 - p) + '%')} מהקודם. אפשר לחשב את השינוי ול${up ? 'הוסיף' : 'הוריד'}, או לחשב ישר את ${m((up ? 100 + p : 100 - p) + '%')}.`,
        `השינוי: ${m(p + '%')} מ-${m(P)}.`,
      ],
      solution: [`השינוי: ${m(fmt((P * p) / 100))} ש"ח.`, `${m(`${P} ${up ? '+' : '−'} ${fmt((P * p) / 100)} = ${fmt(newP)}`)}`],
      mistakes: mistakes(isNum(newP), [numMistake((P * p) / 100, 'זה רק גובה השינוי. צריך להוסיף או להוריד אותו מהמחיר.')]),
    };
  }
  // level 3: up then down by the same percent
  const p = pick(rng, [10, 20, 50, 25]);
  const P = niceWhole(rng, p, 10) * (p === 25 ? 4 : p === 10 ? 10 : 5);
  const up = P + (P * p) / 100;
  const ans = up - (up * p) / 100;
  return {
    subtopicId: id,
    level,
    prompt: `מחיר של ${m(P)} ש"ח התייקר ב-${m(p + '%')}, ואחרי חודש הוזל ב-${m(p + '%')}. מה המחיר הסופי?`,
    answer: { kind: 'number', value: ans, unit: 'ש"ח' },
    hints: [
      'שני שינויים בזה אחר זה. מלכודת: נראה כאילו הם מבטלים זה את זה, אבל זה לא בטוח.',
      'כל אחוז מחושב מהמחיר **שהיה באותו רגע**. ההוזלה מחושבת מהמחיר שאחרי ההתייקרות, שהוא גדול יותר.',
      `קודם המחיר אחרי ההתייקרות: ${m(`${P} + ${p}%`)}`,
    ],
    solution: [`אחרי התייקרות: ${m(`${P} + ${fmt((P * p) / 100)} = ${fmt(up)}`)}`, `הוזלה של ${m(p + '%')} מ-${m(fmt(up))}: ${m(fmt((up * p) / 100))}`, `${m(`${fmt(up)} − ${fmt((up * p) / 100)} = ${fmt(ans)}`)} ש"ח. פחות מהמחיר המקורי!`],
    mistakes: mistakes(isNum(ans), [numMistake(P, 'זה המחיר המקורי. ההתייקרות וההוזלה לא מבטלות זו את זו, כי ההוזלה מחושבת ממחיר גבוה יותר.')]),
  };
}

export const percentUnit: UnitContent = {
  hook: {
    title: 'מתוך 100',
    text: '"פר צנט" זה "מתוך מאה". 30% הנחה פירושו: מכל 100 שקלים מורידים 30. כל שאלת אחוזים שואלת אחד משלושה דברים: מה החלק, מה השלם, או איזה אחוז. מי שמזהה מה שואלים, כבר באמצע הדרך.',
  },
  tricks: [
    '10% = מחלקים ב-10. 1% = מחלקים ב-100. מהם בונים כל אחוז.',
    '50% = חצי, 25% = רבע, 20% = חמישית.',
    'אחרי הנחה של 20% משלמים 80%. אחרי התייקרות של 20% משלמים 120%.',
  ],
  commonMistakes: [
    { title: 'לשכוח לחלק ב-100', text: '30% מ-200 זה לא {{6000}}. זה {{200 ÷ 100 × 30 = 60}}.' },
    { title: 'לבלבל חלק ושלם', text: 'אם 25% הם 40, השלם הוא 160, לא 10. השלם תמיד גדול מהחלק.' },
    { title: 'התייקרות והוזלה מבטלות זו את זו?', text: 'לא! 100 עולה ב-10% ל-110, ואז יורד ב-10% ל-99. ההוזלה חושבה מ-110.' },
  ],
  subtopics: [
    {
      id: 'percent.of',
      title: 'משמעות האחוז: חישוב ערך האחוז',
      addedIn: V,
      generate: of,
      explanations: [
        {
          label: '100 משבצות',
          title: 'אחוז = משבצות מתוך 100',
          interactive: 'percentGrid',
          paragraphs: ['דמייני שהכמות מחולקת ל-100 משבצות שוות. {{30%}} זה 30 משבצות.', 'כדי לחשב, מוצאים כמה שווה משבצת אחת (1%), וכופלים.', 'שחקי בהדמיה: שני את האחוז ואת הכמות.'],
        },
        {
          label: 'סולם 10%',
          title: 'סולם ה-10%',
          paragraphs: ['10% = מחלקים ב-10. משם: 20% = פעמיים, 5% = חצי, 30% = שלוש פעמים.', 'חישוב בראש, בלי מחשבון.'],
          example: { question: '35% מ-80', steps: ['10% = 8', '30% = 24', '5% = 4', '35% = {{24 + 4 = 28}}'] },
        },
      ],
    },
    {
      id: 'percent.what-percent',
      title: 'חישוב מספר האחוזים',
      addedIn: V,
      generate: whatPercent,
      explanations: [
        {
          label: 'שבר',
          title: 'משבר לאחוזים',
          paragraphs: ['"איזה אחוז" = איזה חלק, כשהמכנה הוא 100.', 'כותבים חלק/שלם, ומרחיבים למכנה 100 (או כופלים ב-100).'],
          example: { question: '12 מתוך 40 זה כמה אחוזים?', steps: ['{{12/40 = 3/10}}', '{{3/10 = 30/100}}', '30%'] },
        },
        {
          label: 'מבחן',
          title: 'כמו ציון במבחן',
          paragraphs: ['ענית נכון על 18 מתוך 20 שאלות. מה הציון?', '{{18/20 = 90/100}}, כלומר 90. ציון במבחן הוא בדיוק "כמה אחוזים מהשאלות נכונות".'],
        },
      ],
    },
    {
      id: 'percent.whole',
      title: 'חישוב הכמות השלמה',
      addedIn: V,
      generate: whole,
      explanations: [
        {
          label: 'אחורה',
          title: 'מהחלק לשלם',
          paragraphs: ['יודעים כמה שווים 20%, ומחפשים 100%.', 'מוצאים 1% (מחלקים ב-20), ואז 100% (כופלים ב-100).', 'או בקיצור: 20% זה חמישית, אז השלם גדול פי 5.'],
          example: { question: '20% הם 30. מה השלם?', steps: ['1% = {{30 ÷ 20 = 1.5}}', '100% = {{150}}', 'או: {{30 × 5 = 150}}'] },
        },
        {
          label: 'בדיקה',
          title: 'בדיקת היגיון',
          paragraphs: ['השלם תמיד גדול מהחלק (אם האחוז קטן מ-100).', 'בסוף בודקים: האם 20% מהתשובה שלי באמת שווים למה שנתון?'],
        },
      ],
    },
    {
      id: 'percent.change',
      title: 'הוזלה והתייקרות',
      addedIn: V,
      generate: change,
      explanations: [
        {
          label: 'מה נשאר',
          title: 'כמה אחוזים משלמים?',
          paragraphs: ['הנחה של 30%: משלמים 70% מהמחיר.', 'התייקרות של 15%: משלמים 115% מהמחיר.', 'כך מחשבים בצעד אחד.'],
          example: { question: '200 ש"ח בהנחה של 30%', steps: ['משלמים 70%', '{{200 ÷ 100 × 70 = 140}} ש"ח'] },
        },
        {
          label: 'מלכודת',
          title: 'שני שינויים בזה אחר זה',
          paragraphs: ['כל שינוי באחוזים מחושב מהמחיר **הנוכחי**, לא מהמקורי.', '100 → (+10%) → 110 → (−10%) → 99.', 'זה גם הסיבה שמ"מבצעים כפולים" כדאי להיזהר.'],
        },
      ],
    },
  ],
};
