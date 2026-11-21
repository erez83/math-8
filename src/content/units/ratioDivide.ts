import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, coprimeTuple, type Rng } from '../../lib/random';
import { m, r, isNum, mistakes, numMistake, pickPair, TRIOS } from '../helpers';

const V = '0.1.0';

// ---------- ratio-divide.basic ----------
function basic(level: Level, rng: Rng): Exercise {
  const id = 'ratio-divide.basic';
  const [p1, p2] = pickPair(rng);
  const [a, b] = coprimeTuple(rng, 2, 1, level === 1 ? 5 : 9);
  const k = level === 1 ? int(rng, 2, 10) : int(rng, 5, 40);
  const boxes = a + b;
  const N = boxes * k;

  if (level === 3) {
    const big = Math.max(a, b) * k;
    return {
      subtopicId: id,
      level,
      prompt: `חוט באורך ${m(N)} ס"מ נחתך לשני חלקים ביחס ${r(a, b)}. מה האורך של החלק **הארוך**?`,
      answer: { kind: 'number', value: big, unit: 'ס"מ' },
      hints: [
        'החוט נחתך לשני חלקים **לא שווים**, לפי היחס. שואלים כמה ארוך החלק הארוך.',
        'שיטת הקופסאות: היחס אומר מכמה קופסאות שוות בנוי כל חלק. סופרים את כל הקופסאות, מוצאים את האורך של קופסה אחת, ואז את האורך של החלק עם יותר קופסאות.',
        `כמה קופסאות יש בסך הכול? ${m(`${a} + ${b}`)}`,
      ],
      solution: [`קופסאות: ${m(`${a} + ${b} = ${boxes}`)}.`, `קופסה אחת: ${m(`${N} ÷ ${boxes} = ${k}`)} ס"מ.`, `החלק הארוך (${m(Math.max(a, b))} קופסאות): ${m(`${Math.max(a, b)} × ${k} = ${big}`)} ס"מ.`],
      mistakes: mistakes(isNum(big), [
        numMistake(Math.min(a, b) * k, 'זה אורך החלק **הקצר**. השאלה שואלת על הארוך.'),
        numMistake(k, `${m(k)} זה הערך של קופסה **אחת**. החלק הארוך הוא כמה קופסאות.`),
        numMistake(N / 2, 'חילקת לשני חלקים שווים. כאן החלוקה היא לפי היחס, לא שווה בשווה.'),
      ]),
      visual: { type: 'barModel', parts: [a, b], labels: ['חלק א', 'חלק ב'] },
    };
  }

  const askFirst = level === 1;
  const ans = (askFirst ? a : b) * k;
  const who = askFirst ? p1 : p2;
  return {
    subtopicId: id,
    level,
    prompt: `${p1} ו${p2} חילקו ביניהם ${m(N)} ש"ח ביחס ${r(a, b)} (${p1} : ${p2}). כמה כסף קיבל/ה **${who}**?`,
    answer: { kind: 'number', value: ans, unit: 'ש"ח' },
    hints: [
      `מחלקים סכום כסף **לא שווה בשווה**, אלא לפי היחס. שואלים כמה מקבל/ת ${who}.`,
      'שיטת הקופסאות: היחס אומר כמה קופסאות שוות יש לכל אחד. (1) סופרים את כל הקופסאות, (2) מחלקים את הכסף כדי לדעת כמה בקופסה אחת, (3) כופלים במספר הקופסאות של מי שנשאל.',
      `כמה קופסאות יש בסך הכול? ${m(`${a} + ${b}`)}`,
    ],
    solution: [
      `קופסאות: ${m(`${a} + ${b} = ${boxes}`)}.`,
      `קופסה אחת: ${m(`${N} ÷ ${boxes} = ${k}`)} ש"ח.`,
      `${who}: ${m(`${askFirst ? a : b} × ${k} = ${ans}`)} ש"ח.`,
    ],
    mistakes: mistakes(isNum(ans), [
      numMistake(N / 2, 'חילקת שווה בשווה. כאן כל אחד מקבל לפי מספר הקופסאות שלו ביחס.'),
      numMistake(k, `${m(k)} זה הערך של קופסה **אחת**. צריך להכפיל במספר הקופסאות של ${who}.`),
      numMistake((askFirst ? b : a) * k, `זה הסכום של ${askFirst ? p2 : p1}. בדקי את הסדר ביחס.`),
      numMistake(N / (askFirst ? a : b), `חילקת את ${m(N)} במספר הקופסאות של ${who}. קודם מחלקים את הסכום **בכל** הקופסאות (${m(boxes)}).`),
    ]),
    visual: { type: 'barModel', parts: [a, b], labels: [p1, p2] },
  };
}

// ---------- ratio-divide.whole-from-part ----------
function wholeFromPart(level: Level, rng: Rng): Exercise {
  const id = 'ratio-divide.whole-from-part';
  const [p1, p2] = pickPair(rng);
  const [a, b] = coprimeTuple(rng, 2, 1, 9);
  const k = int(rng, 2, 25);
  const first = a * k;
  const second = b * k;
  const total = first + second;

  if (level === 2) {
    return {
      subtopicId: id,
      level,
      prompt: `${p1} ו${p2} חילקו ביניהם מדבקות ביחס ${r(a, b)}. ${p1} קיבל/ה ${m(first)} מדבקות. כמה מדבקות קיבל/ה ${p2}?`,
      answer: { kind: 'number', value: second, unit: 'מדבקות' },
      hints: [
        `שואלים כמה קיבל/ה ${p2}. לא יודעים כמה היה בסך הכול, יודעים רק כמה קיבל/ה ${p1}.`,
        'החלק הידוע בנוי מכמה קופסאות שוות. אם יודעים כמה הן שוות ביחד, אפשר למצוא כמה שווה קופסה **אחת**. משם מגיעים לכל חלק אחר.',
        `ל${p1} יש ${m(a)} קופסאות ששוות ${m(first)}. כמה שווה קופסה אחת? ${m(`${first} ÷ ${a}`)}`,
      ],
      solution: [`קופסה אחת: ${m(`${first} ÷ ${a} = ${k}`)}.`, `${p2}: ${m(`${b} × ${k} = ${second}`)}.`],
      mistakes: mistakes(isNum(second), [
        numMistake(first + (b - a), 'הוספת את ההפרש בין המספרים ביחס. ביחס כופלים: קודם מוצאים כמה שווה קופסה אחת.'),
        numMistake(total, 'זה הסכום של שניהם ביחד. השאלה היא כמה קיבל/ה רק ' + p2 + '.'),
      ]),
      visual: { type: 'barModel', parts: [a, b], labels: [p1, p2] },
    };
  }
  const bigger = a > b ? first : second;
  const biggerParts = Math.max(a, b);
  const isL3 = level === 3;
  return {
    subtopicId: id,
    level,
    prompt: isL3
      ? `סכום כסף חולק בין ${p1} ל${p2} ביחס ${r(a, b)}. החלק **הגדול** היה ${m(bigger)} ש"ח. כמה כסף חולק בסך הכול?`
      : `${p1} ו${p2} חילקו ביניהם כסף ביחס ${r(a, b)}. ${p1} קיבל/ה ${m(first)} ש"ח. כמה כסף חילקו בסך הכול?`,
    answer: { kind: 'number', value: total, unit: 'ש"ח' },
    hints: isL3
      ? [
          'שואלים כמה כסף היה **בסך הכול**. יודעים רק את החלק הגדול.',
          'קודם מבינים לאיזה חלק ביחס שייך "החלק הגדול": זה המספר הגדול ביחס. ממנו מוצאים כמה שווה קופסה אחת, ואז כופלים בכל הקופסאות.',
          `לחלק הגדול יש ${m(biggerParts)} קופסאות ששוות ${m(bigger)}. כמה שווה קופסה אחת?`,
        ]
      : [
          'שואלים כמה כסף היה **בסך הכול**. יודעים רק כמה קיבל אחד מהם.',
          'החלק הידוע בנוי מכמה קופסאות שוות. מוצאים כמה שווה קופסה אחת, ואז כופלים במספר **כל** הקופסאות של שניהם.',
          `ל${p1} יש ${m(a)} קופסאות ששוות ${m(first)}. כמה שווה קופסה אחת?`,
        ],
    solution: isL3
      ? [`קופסה: ${m(`${bigger} ÷ ${biggerParts} = ${k}`)}.`, `כל הקופסאות: ${m(`${a} + ${b} = ${a + b}`)}.`, `סך הכול: ${m(`${a + b} × ${k} = ${total}`)} ש"ח.`]
      : [`קופסה: ${m(`${first} ÷ ${a} = ${k}`)}.`, `כל הקופסאות: ${m(`${a} + ${b} = ${a + b}`)}.`, `סך הכול: ${m(`${a + b} × ${k} = ${total}`)} ש"ח.`],
    mistakes: mistakes(isNum(total), [
      numMistake(second, `זה רק החלק של ${p2}. השאלה שואלת על הסכום **הכולל**.`),
      numMistake(isL3 ? bigger * 2 : first * 2, 'הכפלת ב-2 כאילו החלוקה שווה. צריך לחשב לפי מספר הקופסאות.'),
    ]),
    visual: { type: 'barModel', parts: [a, b], labels: [p1, p2] },
  };
}

// ---------- ratio-divide.three-parts ----------
function threeParts(level: Level, rng: Rng): Exercise {
  const id = 'ratio-divide.three-parts';
  const names = pick(rng, TRIOS);
  const parts = coprimeTuple(rng, 3, 1, level === 1 ? 4 : 7);
  const k = int(rng, 2, level === 1 ? 10 : 20);
  const boxes = parts[0] + parts[1] + parts[2];
  const N = boxes * k;
  if (level === 3) {
    const i = int(rng, 0, 2);
    let j = int(rng, 0, 2);
    while (j === i) j = int(rng, 0, 2);
    const ans = parts[j] * k;
    return {
      subtopicId: id,
      level,
      prompt: `${names.join(', ')} חילקו ביניהם פרסים ביחס ${r(...parts)} (לפי הסדר). ${names[i]} קיבל/ה ${m(parts[i] * k)} פרסים. כמה פרסים קיבל/ה ${names[j]}?`,
      answer: { kind: 'number', value: ans },
      hints: [
        `שואלים כמה קיבל/ה ${names[j]}. לא יודעים כמה פרסים היו בסך הכול, רק כמה קיבל/ה ${names[i]}.`,
        'לא צריך את הסכום הכולל. מהחלק הידוע מוצאים כמה שווה קופסה אחת, וכופלים במספר הקופסאות של מי שנשאל.',
        `ל${names[i]} יש ${m(parts[i])} קופסאות ששוות ${m(parts[i] * k)}. כמה שווה קופסה אחת?`,
      ],
      solution: [`קופסה: ${m(`${parts[i] * k} ÷ ${parts[i]} = ${k}`)}.`, `${names[j]}: ${m(`${parts[j]} × ${k} = ${ans}`)}.`],
      mistakes: [],
      visual: { type: 'barModel', parts, labels: [...names] },
    };
  }
  const j = level === 1 ? 0 : int(rng, 1, 2);
  const ans = parts[j] * k;
  return {
    subtopicId: id,
    level,
    prompt: `${names.join(', ')} חילקו ביניהם ${m(N)} ש"ח ביחס ${r(...parts)} (לפי הסדר). כמה קיבל/ה ${names[j]}?`,
    answer: { kind: 'number', value: ans, unit: 'ש"ח' },
    hints: [
      `מחלקים סכום בין **שלושה**, לפי היחס. שואלים רק על החלק של ${names[j]}.`,
      'אותה שיטת קופסאות, עם שותף נוסף: סופרים את הקופסאות של שלושתם, מחלקים את הכסף כדי לדעת כמה בקופסה אחת, וכופלים במספר הקופסאות של מי שנשאל.',
      `כמה קופסאות יש לשלושתם ביחד? ${m(parts.join(' + '))}`,
    ],
    solution: [`קופסאות: ${m(`${parts.join(' + ')} = ${boxes}`)}.`, `קופסה: ${m(`${N} ÷ ${boxes} = ${k}`)}.`, `${names[j]}: ${m(`${parts[j]} × ${k} = ${ans}`)} ש"ח.`],
    mistakes: mistakes(isNum(ans), [
      numMistake(N / 3, 'חילקת לשלושה חלקים שווים. החלוקה היא לפי היחס.'),
      numMistake(k, `זה הערך של קופסה **אחת**. ל${names[j]} יש ${m(parts[j])} קופסאות.`),
    ]),
    visual: { type: 'barModel', parts, labels: [...names] },
  };
}

// ---------- ratio-divide.difference ----------
function difference(level: Level, rng: Rng): Exercise {
  const id = 'ratio-divide.difference';
  const [p1, p2] = pickPair(rng);
  let [a, b] = coprimeTuple(rng, 2, 1, 9);
  if (a > b) [a, b] = [b, a];
  const k = int(rng, 2, 20);
  const D = (b - a) * k;
  if (level === 3) {
    const parts = coprimeTuple(rng, 3, 1, 8); // never all equal
    const big = Math.max(...parts);
    const small = Math.min(...parts);
    const diff = (big - small) * k;
    const total = (parts[0] + parts[1] + parts[2]) * k;
    return {
      subtopicId: id,
      level,
      prompt: `שלוש כיתות אספו בקבוקים ביחס ${r(...parts)}. הכיתה שאספה הכי הרבה אספה ${m(diff)} בקבוקים יותר מהכיתה שאספה הכי מעט. כמה בקבוקים נאספו בסך הכול?`,
      answer: { kind: 'number', value: total, unit: 'בקבוקים' },
      hints: [
        'שואלים כמה בקבוקים נאספו בסך הכול. לא נתון הסכום, נתון רק **ההפרש** בין הכיתה הגדולה לקטנה.',
        'ההפרש בבקבוקים שווה בדיוק לקופסאות ה"עודפות" שיש לכיתה הגדולה מעל הקטנה. מהן מוצאים כמה שווה קופסה אחת, ואז כופלים בכל הקופסאות.',
        `כמה קופסאות עודפות יש לכיתה הגדולה? ${m(`${big} − ${small}`)}`,
      ],
      solution: [`הפרש בקופסאות: ${m(`${big} − ${small} = ${big - small}`)}.`, `קופסה: ${m(`${diff} ÷ ${big - small} = ${k}`)}.`, `סך הכול: ${m(`${parts.join(' + ')} = ${parts[0] + parts[1] + parts[2]}`)} קופסאות, ${m(`× ${k} = ${total}`)}.`],
      mistakes: [],
      visual: { type: 'barModel', parts, labels: ['א', 'ב', 'ג'] },
    };
  }
  const ans = level === 1 ? a * k : (a + b) * k;
  return {
    subtopicId: id,
    level,
    prompt:
      level === 1
        ? `${p1} ו${p2} חילקו ביניהם כסף ביחס ${r(a, b)}. ${p2} קיבל/ה ${m(D)} ש"ח יותר מ${p1}. כמה קיבל/ה ${p1}?`
        : `${p1} ו${p2} חילקו ביניהם כסף ביחס ${r(a, b)}. ${p2} קיבל/ה ${m(D)} ש"ח יותר מ${p1}. כמה כסף חילקו בסך הכול?`,
    answer: { kind: 'number', value: ans, unit: 'ש"ח' },
    hints: [
      level === 1
        ? `שואלים כמה קיבל/ה ${p1}. לא נתון כמה חילקו, נתון רק **בכמה יותר** קיבל/ה ${p2}.`
        : 'שואלים כמה חילקו בסך הכול. לא נתון הסכום, נתון רק **ההפרש** בין השניים.',
      `ל${p2} יש יותר קופסאות. ההפרש בכסף שווה בדיוק לקופסאות העודפות. מהן מוצאים כמה שווה קופסה אחת, וממשיכים כרגיל.`,
      `כמה קופסאות יש ל${p2} יותר מל${p1}? ${m(`${b} − ${a}`)}`,
    ],
    solution: [
      `ההפרש בקופסאות: ${m(`${b} − ${a} = ${b - a}`)}.`,
      `קופסה: ${m(`${D} ÷ ${b - a} = ${k}`)}.`,
      level === 1 ? `${p1}: ${m(`${a} × ${k} = ${ans}`)} ש"ח.` : `סך הכול: ${m(`(${a} + ${b}) × ${k} = ${ans}`)} ש"ח.`,
    ],
    mistakes: mistakes(isNum(ans), [
      numMistake((D / (a + b)) * (level === 1 ? a : a + b), `חילקת את ההפרש בכל הקופסאות. ההפרש שווה רק ל-${m(b - a)} קופסאות, אלה שיש ל${p2} יותר.`),
      numMistake(k, `${m(k)} זה הערך של קופסה אחת. ${level === 1 ? `ל${p1} יש ${m(a)} קופסאות.` : `בסך הכול יש ${m(a + b)} קופסאות.`}`),
    ]),
    visual: { type: 'barModel', parts: [a, b], labels: [p1, p2] },
  };
}

export const ratioDivideUnit: UnitContent = {
  hook: {
    title: 'שיטת הקופסאות',
    text: 'נועה ואיתי מחלקים פרס של 100 ש"ח ביחס 2:3. דמייני 5 קופסאות זהות: 2 של נועה ו-3 של איתי. מכניסים את הכסף לקופסאות בשווה, 20 ש"ח בכל קופסה, וכל אחד לוקח את הקופסאות שלו.',
  },
  tricks: [
    'קודם כמה קופסאות, אחר כך כמה בכל קופסה.',
    'מצאת כמה שווה קופסה אחת? משם אפשר לענות על כל שאלה: חלק, שלם או הפרש.',
    'הפרש של X ש"ח = כמה קופסאות יש לאחד יותר מלשני.',
  ],
  commonMistakes: [
    { title: 'לחלק לשניים', text: 'חלוקה ביחס היא לא חלוקה שווה. ב-{{2:3}} יש 5 קופסאות, לא 2.' },
    { title: 'לעצור בקופסה אחת', text: 'מצאת כמה שווה קופסה? מצוין! עכשיו צריך להכפיל במספר הקופסאות של מי שנשאל.' },
    { title: 'לחלק את ההפרש בכל הקופסאות', text: 'אם איתי קיבל 20 יותר ביחס {{2:3}}, ה-20 האלה הם קופסה אחת (3 − 2), לא 5 קופסאות.' },
  ],
  subtopics: [
    {
      id: 'ratio-divide.basic',
      title: 'חלוקה ביחס נתון',
      addedIn: V,
      generate: basic,
      explanations: [
        {
          label: 'קופסאות',
          title: 'שיטת הקופסאות',
          interactive: 'boxes',
          paragraphs: [
            '1. **סופרים קופסאות:** ביחס {{2:3}} יש {{2 + 3 = 5}} קופסאות.',
            '2. **ממלאים:** מחלקים את כל הכמות במספר הקופסאות.',
            '3. **לוקחים:** כל אחד מקבל את מספר הקופסאות שלו כפול הערך של קופסה.',
            'שחקי בהדמיה: שני את הסכום ואת היחס, וראי איך הקופסאות מתמלאות.',
          ],
          example: { question: 'חלקי 140 ביחס {{3:4}}', steps: ['קופסאות: {{3 + 4 = 7}}', 'קופסה: {{140 ÷ 7 = 20}}', 'חלקים: {{3 × 20 = 60}}, {{4 × 20 = 80}}', 'בדיקה: {{60 + 80 = 140}} ✓'] },
        },
        {
          label: 'בדיקה',
          title: 'תמיד אפשר לבדוק את עצמך',
          paragraphs: ['אחרי שחילקת, בדקי שני דברים:', '1. **הסכום:** החלקים ביחד שווים לכמות המקורית?', '2. **היחס:** אם תצמצמי את החלקים, תקבלי את היחס שבשאלה?', 'אם שתי הבדיקות עברו, התשובה נכונה.'],
        },
      ],
    },
    {
      id: 'ratio-divide.whole-from-part',
      title: 'מציאת השלם מתוך חלק',
      addedIn: V,
      generate: wholeFromPart,
      explanations: [
        {
          label: 'הפוך',
          title: 'הפעם ידוע חלק, לא הכול',
          interactive: 'boxes',
          paragraphs: [
            'אם ידוע כמה קיבל אחד, יודעים כמה שוות **הקופסאות שלו**.',
            'מחלקים במספר הקופסאות שלו, ומקבלים כמה שווה קופסה אחת.',
            'משם ממשיכים: כופלים בכל הקופסאות כדי לקבל את השלם, או בקופסאות של השני כדי לקבל את החלק שלו.',
          ],
          example: { question: 'יחס {{2:5}}, הראשון קיבל 30. כמה חולק בסך הכול?', steps: ['2 קופסאות = 30, אז קופסה = 15', 'כל הקופסאות: {{2 + 5 = 7}}', 'סך הכול: {{7 × 15 = 105}}'] },
        },
        {
          label: 'סיפור',
          title: 'כמו לנחש פיצה מהמשולשים',
          paragraphs: ['ראית שחברה אכלה 2 משולשים, והיא אכלה 2 מכל 8 משולשים בפיצה. אז הפיצה כולה היא פי 4: 8 משולשים.', 'אותו דבר ביחס: מחלק אחד מגיעים לקופסה, ומקופסה מגיעים לכל השלם.'],
        },
      ],
    },
    {
      id: 'ratio-divide.three-parts',
      title: 'חלוקה לשלושה חלקים',
      addedIn: V,
      generate: threeParts,
      explanations: [
        {
          label: 'קופסאות',
          title: 'אותה שיטה, עוד שותף',
          interactive: 'boxes',
          paragraphs: ['ביחס {{1:2:3}} יש {{1 + 2 + 3 = 6}} קופסאות.', 'מחלקים את הכמות ב-6, וכל אחד מקבל את מספר הקופסאות שלו.', 'השיטה לא משתנה. פשוט יש עוד שותף בחלוקה.'],
        },
        {
          label: 'בדיקה',
          title: 'בדיקה מהירה',
          paragraphs: ['גם כאן: שלושת החלקים ביחד חייבים לתת את הכמות המקורית.'],
          example: { question: 'חלקי 120 ביחס {{1:2:5}}', steps: ['קופסאות: 8', 'קופסה: {{120 ÷ 8 = 15}}', 'חלקים: 15, 30, 75', 'בדיקה: {{15 + 30 + 75 = 120}} ✓'] },
        },
      ],
    },
    {
      id: 'ratio-divide.difference',
      title: 'עוד על חלוקה ביחס: הפרש',
      addedIn: V,
      generate: difference,
      explanations: [
        {
          label: 'קופסאות',
          title: 'ההפרש הוא הקופסאות "העודפות"',
          interactive: 'boxes',
          paragraphs: [
            'ביחס {{3:5}} יש לשני **2 קופסאות יותר** מלראשון.',
            'אם ידוע שהשני קיבל 40 יותר, אז 2 קופסאות = 40, וקופסה = 20.',
            'מכאן ממשיכים כרגיל: הראשון {{3 × 20 = 60}}, השני {{5 × 20 = 100}}.',
          ],
        },
        {
          label: 'ציור',
          title: 'ציירי פסים',
          paragraphs: ['ציירי פס לכל אחד, עם מספר הקופסאות שלו, אחד מתחת לשני.', 'החלק שבולט בפס הארוך הוא ההפרש. ספרי כמה קופסאות יש בו.'],
        },
      ],
    },
  ],
};
