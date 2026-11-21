import type { Exercise, Level, UnitContent } from '../types';
import { int, pick, coprimeTuple, type Rng } from '../../lib/random';
import { m, r, isNum, mistakes, numMistake, ratioMistake } from '../helpers';
import { fmt } from '../../lib/answer';

const V = '0.3.0';

// ---------- scale.reduce ----------
function reduce(level: Level, rng: Rng): Exercise {
  const id = 'scale.reduce';
  if (level === 1) {
    // House plan: 1:N with N in hundreds, answer in meters.
    const N = pick(rng, [100, 200, 500]);
    const d = int(rng, 2, 12);
    const cm = d * N;
    const ans = cm / 100;
    return {
      subtopicId: id,
      level,
      prompt: `בתוכנית של דירה בקנה מידה ${r(1, N)}, אורך החדר הוא ${m(d)} ס"מ. מה אורך החדר במציאות, **במטרים**?`,
      answer: { kind: 'number', value: ans, unit: 'מטר' },
      hints: [
        'קנה מידה אומר כמה פעמים המציאות גדולה מהשרטוט. צריך את האורך האמיתי, ובמטרים.',
        `${r(1, N)} פירושו: כל ס"מ בשרטוט הוא ${m(N)} ס"מ במציאות. קודם מחשבים בס"מ, ובסוף ממירים למטרים (100 ס"מ = 1 מטר).`,
        `כמה ס"מ במציאות? ${m(`${d} × ${N}`)}`,
      ],
      solution: [`${m(`${d} × ${N} = ${cm}`)} ס"מ.`, `${m(`${cm} ÷ 100 = ${fmt(ans)}`)} מטר.`],
      mistakes: mistakes(isNum(ans), [numMistake(cm, `${m(cm)} זה האורך בס"מ. השאלה מבקשת מטרים: מחלקים ב-100.`), numMistake(d, 'זה האורך בשרטוט. צריך להכפיל בקנה המידה.')]),
    };
  }
  const N = pick(rng, [50000, 100000, 200000, 250000, 500000]);
  const kmPerCm = N / 100000;
  if (level === 2) {
    let d = int(rng, 2, 14);
    if (kmPerCm === 0.5 && d % 2) d++;
    const ans = d * kmPerCm;
    return {
      subtopicId: id,
      level,
      prompt: `במפה בקנה מידה ${r(1, N)}, המרחק בין שתי ערים הוא ${m(d)} ס"מ. מה המרחק במציאות, **בק"מ**?`,
      answer: { kind: 'number', value: ans, unit: 'ק"מ' },
      hints: [
        'מחפשים מרחק אמיתי בק"מ, כשנתון המרחק במפה בס"מ.',
        `כל ס"מ במפה הוא ${m(N)} ס"מ במציאות. כדאי להבין קודם כמה ק"מ זה ס"מ אחד: בק"מ יש ${m(100000)} ס"מ.`,
        `ס"מ אחד במפה = ${m(`${N} ÷ 100000`)} ק"מ. עכשיו כפול ${m(d)}.`,
      ],
      solution: [`ס"מ אחד = ${m(N)} ס"מ = ${m(fmt(kmPerCm))} ק"מ.`, `${m(`${d} × ${fmt(kmPerCm)} = ${fmt(ans)}`)} ק"מ.`],
      mistakes: mistakes(isNum(ans), [numMistake(d * N, `${m(d * N)} זה המרחק בס"מ. צריך להמיר לק"מ (לחלק ב-100000).`), numMistake(d * N / 1000, 'חילקת ב-1000. בק"מ יש 100,000 ס"מ (1000 מטר × 100 ס"מ).')]),
    };
  }
  // level 3: real → map
  const D = int(rng, 2, 20) * (kmPerCm >= 1 ? kmPerCm : 1);
  const ans = D / kmPerCm;
  return {
    subtopicId: id,
    level,
    prompt: `המרחק בין שני יישובים הוא ${m(fmt(D))} ק"מ. מה יהיה המרחק ביניהם במפה בקנה מידה ${r(1, N)}, **בס"מ**?`,
    answer: { kind: 'number', value: ans, unit: 'ס"מ' },
    hints: [
      'הפעם הכיוון הפוך: יודעים את המציאות ומחפשים כמה זה במפה. המפה קטנה יותר, אז התשובה תהיה מספר קטן.',
      'כדאי למצוא כמה ק"מ מייצג ס"מ אחד במפה, ואז לבדוק כמה פעמים זה "נכנס" במרחק האמיתי.',
      `ס"מ אחד במפה = ${m(`${N} ÷ 100000 = ${fmt(kmPerCm)}`)} ק"מ. כמה פעמים ${m(fmt(kmPerCm))} נכנס ב-${m(fmt(D))}?`,
    ],
    solution: [`ס"מ אחד במפה = ${m(fmt(kmPerCm))} ק"מ.`, `${m(`${fmt(D)} ÷ ${fmt(kmPerCm)} = ${fmt(ans)}`)} ס"מ.`],
    mistakes: mistakes(isNum(ans), [numMistake(D * kmPerCm, 'כפלת במקום לחלק. המפה קטנה מהמציאות, אז המספר במפה צריך להיות קטן יותר.')]),
  };
}

// ---------- scale.enlarge ----------
function enlarge(level: Level, rng: Rng): Exercise {
  const id = 'scale.enlarge';
  const k = pick(rng, [2, 3, 4, 5, 10, 20]);
  const real = int(rng, 2, 9);
  const animal = pick(rng, ['נמלה', 'חיפושית', 'דבורה', 'פרפר']);
  if (level === 1) {
    const ans = real * k;
    return {
      subtopicId: id,
      level,
      prompt: `${animal} באורך ${m(real)} מ"מ צוירה בספר בקנה מידה ${r(k, 1)}. מה האורך שלה בציור, במ"מ?`,
      answer: { kind: 'number', value: ans, unit: 'מ"מ' },
      hints: [
        'קנה מידה של הגדלה: הציור **גדול** מהמציאות. מחפשים את האורך בציור.',
        `${r(k, 1)} פירושו: כל מ"מ במציאות הופך ל-${m(k)} מ"מ בציור. כלומר הציור גדול פי ${m(k)}.`,
        `הגדילי את האורך האמיתי: ${m(`${real} × ${k}`)}`,
      ],
      solution: [`${m(`${real} × ${k} = ${ans}`)} מ"מ.`],
      mistakes: mistakes(isNum(ans), [numMistake(real / k, 'חילקת. בקנה מידה של הגדלה, הציור גדול יותר מהמציאות.')]),
    };
  }
  if (level === 2) {
    const drawing = real * k;
    return {
      subtopicId: id,
      level,
      prompt: `בציור מוגדל בקנה מידה ${r(k, 1)}, ${animal} באורך ${m(drawing)} מ"מ. מה האורך האמיתי שלה, במ"מ?`,
      answer: { kind: 'number', value: real, unit: 'מ"מ' },
      hints: [
        'יודעים את הגודל בציור המוגדל, ומחפשים את הגודל האמיתי, הקטן יותר.',
        `הציור גדול פי ${m(k)} מהמציאות. כדי לחזור למציאות עושים את הפעולה ההפוכה.`,
        `הקטיני חזרה למציאות: ${m(`${drawing} ÷ ${k}`)}`,
      ],
      solution: [`${m(`${drawing} ÷ ${k} = ${real}`)} מ"מ.`],
      mistakes: mistakes(isNum(real), [numMistake(drawing * k, 'הכפלת. במציאות החרק קטן מהציור המוגדל, אז מחלקים.')]),
    };
  }
  let j = pick(rng, [2, 3, 4, 5, 10, 20]);
  if (j === k) j = k === 20 ? 10 : 20;
  const ans = real * j;
  return {
    subtopicId: id,
    level,
    prompt: `${animal} צוירה בקנה מידה ${r(k, 1)}, ובציור אורכה ${m(real * k)} מ"מ. מה יהיה אורכה בציור בקנה מידה ${r(j, 1)}?`,
    answer: { kind: 'number', value: ans, unit: 'מ"מ' },
    hints: [
      'שני ציורים שונים של אותה חיה. הגודל האמיתי לא משתנה, והוא המפתח.',
      'עוברים דרך המציאות: קודם מוצאים את האורך האמיתי מהציור הראשון, ואז מגדילים לפי קנה המידה השני.',
      `האורך האמיתי: ${m(`${real * k} ÷ ${k}`)}`,
    ],
    solution: [`אמיתי: ${m(`${real * k} ÷ ${k} = ${real}`)} מ"מ.`, `בציור השני: ${m(`${real} × ${j} = ${ans}`)} מ"מ.`],
    mistakes: mistakes(isNum(ans), [numMistake(real * k * j, 'הכפלת את הציור הראשון שוב. קודם חוזרים לגודל האמיתי.')]),
  };
}

// ---------- scale.find ----------
function find(level: Level, rng: Rng): Exercise {
  const id = 'scale.find';
  if (level === 1) {
    const meters = pick(rng, [2, 5, 10, 20, 50]);
    const N = meters * 100;
    return {
      subtopicId: id,
      level,
      prompt: `בשרטוט של גינה, כל ס"מ מייצג ${m(meters)} מטר במציאות. מה קנה המידה? (כתבי בצורה ${m('1:?')})`,
      answer: { kind: 'ratio', parts: [1, N] },
      hints: [
        'קנה מידה הוא יחס בין שרטוט למציאות, **באותן יחידות**.',
        'השרטוט בס"מ והמציאות במטרים. כדי לכתוב יחס צריך להמיר את שניהם לס"מ.',
        `${m(meters)} מטר = כמה ס"מ? ${m(`${meters} × 100`)}`,
      ],
      solution: [`${m(meters)} מטר = ${m(N)} ס"מ.`, `קנה המידה: ${r(1, N)}.`],
      mistakes: [ratioMistake([1, meters], 'שכחת להמיר יחידות. ביחס חייבים אותן יחידות בשני הצדדים: ס"מ מול ס"מ.')],
    };
  }
  if (level === 2) {
    const N = pick(rng, [25000, 50000, 100000, 200000]);
    const d = int(rng, 2, 10);
    const D = (d * N) / 100000;
    return {
      subtopicId: id,
      level,
      prompt: `מרחק של ${m(fmt(D))} ק"מ מופיע במפה כ-${m(d)} ס"מ. מה קנה המידה של המפה? (כתבי ${m('1:?')})`,
      answer: { kind: 'ratio', parts: [1, N] },
      hints: [
        'מחפשים כמה ס"מ במציאות מייצג ס"מ **אחד** במפה.',
        'קודם ממירים את המרחק האמיתי לס"מ (בק"מ יש 100,000 ס"מ), ואז מחלקים במרחק שבמפה.',
        `${m(fmt(D))} ק"מ = ${m(`${fmt(D)} × 100000`)} ס"מ. עכשיו חלקי ב-${m(d)}.`,
      ],
      solution: [`${m(`${fmt(D)} ק"מ = ${D * 100000}`)} ס"מ.`, `${m(`${D * 100000} ÷ ${d} = ${N}`)}`, `קנה המידה: ${r(1, N)}.`],
      mistakes: [ratioMistake([d, D], 'כתבת יחס עם יחידות שונות (ס"מ מול ק"מ). צריך להמיר את שניהם לס"מ ולצמצם ל-1.')],
    };
  }
  const [real, drawing] = coprimeTuple(rng, 2, 1, 9);
  const kk = pick(rng, [2, 5, 10]);
  const realMm = real;
  const drawCm = (drawing * kk * real) / 10;
  // ratio drawing:real in mm = drawing*kk*real : real  → simplify by real → drawing*kk : 1
  return {
    subtopicId: id,
    level,
    prompt: `חרק באורך ${m(realMm)} מ"מ צויר באורך ${m(fmt(drawCm))} ס"מ. מה קנה המידה של הציור? (כתבי ${m('?:1')})`,
    answer: { kind: 'ratio', parts: [drawing * kk, 1] },
    hints: [
      'זו הגדלה: הציור גדול מהמציאות. קנה המידה יהיה בצורה "משהו:1".',
      'קודם מביאים לאותן יחידות (ס"מ למ"מ: כפול 10), ואז בודקים פי כמה הציור גדול מהמציאות.',
      `${m(fmt(drawCm))} ס"מ = ${m(`${fmt(drawCm)} × 10`)} מ"מ.`,
    ],
    solution: [`${m(`${fmt(drawCm)} ס"מ = ${fmt(drawCm * 10)}`)} מ"מ.`, `${m(`${fmt(drawCm * 10)} ÷ ${realMm} = ${drawing * kk}`)}`, `קנה המידה: ${r(drawing * kk, 1)}.`],
    mistakes: [],
  };
}

// ---------- scale.area ----------
function area(level: Level, rng: Rng): Exercise {
  const id = 'scale.area';
  if (level === 1) {
    const k = int(rng, 2, 6);
    const ans = k * k;
    return {
      subtopicId: id,
      level,
      prompt: `מגדילים ריבוע כך שכל צלע שלו גדלה פי ${m(k)}. פי כמה גדל **השטח** שלו?`,
      answer: { kind: 'number', value: ans },
      hints: [
        'שואלים על השטח, לא על הצלע. זה ההבדל החשוב.',
        'השטח הוא אורך × רוחב, ו**שניהם** גדלו. ציירי בראש: כמה ריבועים קטנים נכנסים בריבוע הגדול?',
        `האורך גדל פי ${m(k)} וגם הרוחב פי ${m(k)}. כמה זה ${m(`${k} × ${k}`)}?`,
      ],
      solution: [`האורך פי ${m(k)}, הרוחב פי ${m(k)}.`, `השטח: ${m(`${k} × ${k} = ${ans}`)}. פי ${m(ans)}.`],
      mistakes: mistakes(isNum(ans), [numMistake(k, `זה פי כמה גדלה הצלע. השטח גדל יותר, כי גם האורך וגם הרוחב גדלו פי ${m(k)}.`), numMistake(2 * k, `השטח גדל פי ${m(k)} כפול ${m(k)}, לא ${m(k)} ועוד ${m(k)}.`)]),
    };
  }
  if (level === 2) {
    const [a, b] = coprimeTuple(rng, 2, 1, 7);
    return {
      subtopicId: id,
      level,
      prompt: `היחס בין הצלעות של שני ריבועים הוא ${r(a, b)}. מה היחס בין **השטחים** שלהם?`,
      answer: { kind: 'ratio', parts: [a * a, b * b] },
      hints: [
        'נתון יחס האורכים, ושואלים על יחס השטחים.',
        'שטח של ריבוע הוא צלע × צלע. אם צלעות נמצאות ביחס מסוים, השטחים נמצאים ביחס של הריבועים.',
        `נניח שהצלעות הן ${m(a)} ו-${m(b)}. מה השטח של כל ריבוע?`,
      ],
      solution: [`שטחים: ${m(`${a}² = ${a * a}`)} ו-${m(`${b}² = ${b * b}`)}.`, `יחס השטחים: ${r(a * a, b * b)}.`],
      mistakes: [ratioMistake([a, b], 'זה יחס הצלעות. יחס השטחים הוא יחס הריבועים: כל מספר בריבוע.')],
    };
  }
  const k = pick(rng, [2, 3, 4, 5]);
  const orig = int(rng, 3, 20);
  const big = orig * k * k;
  return {
    subtopicId: id,
    level,
    prompt: `תמונה הוגדלה כך שכל צלע שלה גדלה פי ${m(k)}. שטח התמונה המוגדלת הוא ${m(big)} סמ"ר. מה היה השטח המקורי?`,
    answer: { kind: 'number', value: orig, unit: 'סמ"ר' },
    hints: [
      'הולכים אחורה: מהתמונה הגדולה לתמונה המקורית, וזה שטח.',
      `כשהצלעות גדלות פי ${m(k)}, השטח גדל פי ${m(`${k} × ${k}`)}. כדי לחזור למקור, מחלקים באותו מספר.`,
      `השטח גדל פי ${m(k * k)}. חלקי: ${m(`${big} ÷ ${k * k}`)}`,
    ],
    solution: [`השטח גדל פי ${m(`${k}² = ${k * k}`)}.`, `${m(`${big} ÷ ${k * k} = ${orig}`)} סמ"ר.`],
    mistakes: mistakes(isNum(orig), [numMistake(big / k, `חילקת רק ב-${m(k)}. השטח גדל פי ${m(k * k)}, כי גם האורך וגם הרוחב גדלו.`)]),
  };
}

export const scaleUnit: UnitContent = {
  hook: {
    title: 'זום במפה',
    text: 'כשמקטינים מפה בטלפון, הכביש של 10 ק"מ נהיה קו של 2 ס"מ. קנה מידה הוא בדיוק ה"זום" הזה: הוא אומר פי כמה הקטינו או הגדילו. ויש בו הפתעה: כשמגדילים פי 2, השטח גדל פי 4!',
  },
  tricks: [
    '{{1:N}} = כל ס"מ בשרטוט הוא N ס"מ במציאות.',
    'בק"מ יש {{100000}} ס"מ. במטר יש {{100}} ס"מ.',
    'אורך פי k, שטח פי {{k²}}.',
  ],
  commonMistakes: [
    { title: 'לשכוח להמיר יחידות', text: 'קנה מידה הוא תמיד באותן יחידות. 1 ס"מ = 5 מטר זה {{1:500}}, לא {{1:5}}.' },
    { title: 'לכפול כשצריך לחלק', text: 'במפה המרחקים קטנים. ממציאות למפה מחלקים, ממפה למציאות מכפילים.' },
    { title: 'שטח גדל כמו אורך', text: 'ריבוע שהצלע שלו גדלה פי 3 גדל בשטח פי 9, לא פי 3.' },
  ],
  subtopics: [
    {
      id: 'scale.reduce',
      title: 'קנה מידה בהקטנה',
      addedIn: V,
      generate: reduce,
      explanations: [
        {
          label: 'מפה',
          title: 'מה אומר {{1:50000}}?',
          paragraphs: [
            'בקנה מידה {{1:50000}}, כל ס"מ במפה הוא **50,000 ס"מ** במציאות.',
            '50,000 ס"מ = 500 מטר = חצי ק"מ.',
            'אז 6 ס"מ במפה הם {{6 × 0.5 = 3}} ק"מ במציאות.',
          ],
        },
        {
          label: 'סולם יחידות',
          title: 'סולם ההמרות',
          paragraphs: ['ס"מ → מטר: מחלקים ב-100.', 'מטר → ק"מ: מחלקים ב-1000.', 'ס"מ → ק"מ: מחלקים ב-100,000 (מורידים 5 אפסים).', 'טריק: קודם מחשבים בס"מ, ובסוף ממירים פעם אחת.'],
        },
      ],
    },
    {
      id: 'scale.enlarge',
      title: 'קנה מידה בהגדלה',
      addedIn: V,
      generate: enlarge,
      explanations: [
        {
          label: 'זכוכית מגדלת',
          title: 'כשהציור גדול מהמציאות',
          paragraphs: ['בספרי טבע מגדילים חרקים, ואז קנה המידה כתוב הפוך: {{10:1}}.', 'כל מ"מ במציאות הוא 10 מ"מ בציור. הציור גדול פי 10.'],
        },
        {
          label: 'כלל אצבע',
          title: 'איך לא להתבלבל',
          paragraphs: ['תמיד שואלים: מי גדול יותר, הציור או המציאות?', 'בהגדלה: מציאות → ציור מכפילים, ציור → מציאות מחלקים.', 'בהקטנה (מפה): בדיוק להפך.'],
        },
      ],
    },
    {
      id: 'scale.find',
      title: 'מציאת קנה המידה',
      addedIn: V,
      generate: find,
      explanations: [
        {
          label: 'שלבים',
          title: 'שלושה צעדים',
          paragraphs: ['1. כותבים שרטוט:מציאות.', '2. ממירים לאותן יחידות (בדרך כלל ס"מ).', '3. מצמצמים עד שבצד אחד יש 1.'],
          example: { question: '4 ס"מ במפה = 2 ק"מ. מה קנה המידה?', steps: ['2 ק"מ = 200,000 ס"מ', '{{4:200000}}', 'מחלקים ב-4: {{1:50000}}'] },
        },
        {
          label: 'בדיקה',
          title: 'בדיקת שפיות',
          paragraphs: ['מפה של עיר היא בערך {{1:10000}}. מפה של מדינה היא בערך {{1:1000000}}. תוכנית של בית היא בערך {{1:100}}.', 'אם יצא לך {{1:5}} לעיר שלמה, כנראה שכחת להמיר יחידות.'],
        },
      ],
    },
    {
      id: 'scale.area',
      title: 'יחס האורכים ויחס השטחים',
      addedIn: V,
      generate: area,
      explanations: [
        {
          label: 'אריחים',
          title: 'למה השטח קופץ?',
          interactive: 'areaScale',
          paragraphs: [
            'כשמגדילים פי 2, גם האורך וגם הרוחב גדלים פי 2.',
            'לכן בריבוע הגדול נכנסים {{2 × 2 = 4}} ריבועים מקוריים. השטח גדל פי 4.',
            'שחקי בהדמיה: נסי הגדלה פי 3, ותראי 9 ריבועים.',
          ],
        },
        {
          label: 'כלל',
          title: 'הכלל',
          paragraphs: ['אם יחס האורכים הוא {{a:b}}, יחס השטחים הוא {{a²:b²}}.', 'במפה בקנה מידה {{1:100}}, שטחים קטנים פי {{100² = 10000}}.'],
        },
      ],
    },
  ],
};
