import type { Exercise, Level, UnitContent } from '../types';
import { int, type Rng } from '../../lib/random';
import { m, isNum, mistakes, numMistake } from '../helpers';
import { fmt } from '../../lib/answer';

const V = '0.4.0';
const PI = 3.14;
const r2 = (x: number) => Math.round(x * 100) / 100;
const PI_NOTE = `(השתמשי ב-${m('π ≈ 3.14')})`;

// ---------- area.basic ----------
function basic(level: Level, rng: Rng): Exercise {
  const id = 'area.basic';
  if (level === 1) {
    const w = int(rng, 3, 15);
    const h = int(rng, 2, 12);
    const square = rng() < 0.3;
    const H = square ? w : h;
    const ans = w * H;
    return {
      subtopicId: id,
      level,
      prompt: square ? `מה השטח של ריבוע שאורך צלעו ${m(w)} ס"מ?` : `מה השטח של מלבן שאורכו ${m(w)} ס"מ ורוחבו ${m(h)} ס"מ?`,
      answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
      hints: [
        'שטח = כמה משבצות של סנטימטר על סנטימטר נכנסות בתוך הצורה.',
        'במלבן המשבצות מסודרות בשורות: מספר השורות כפול מספר המשבצות בכל שורה. כלומר אורך × רוחב.',
        `כפלי: ${m(`${w} × ${H}`)} = ?`,
      ],
      solution: [`${m(`${w} × ${H} = ${ans}`)} סמ"ר`],
      mistakes: mistakes(isNum(ans), [numMistake(2 * (w + H), 'זה ההיקף (המסגרת מסביב). השטח הוא מה שבפנים: אורך × רוחב.')]),
      visual: { type: 'shape', kind: 'rect', labels: { w: String(w), h: String(H) } },
    };
  }
  if (level === 2) {
    const base = int(rng, 4, 16);
    let height = int(rng, 3, 12);
    if ((base * height) % 2) height++;
    const side = height + int(rng, 1, 4);
    const ans = (base * height) / 2;
    return {
      subtopicId: id,
      level,
      prompt: `מה השטח של המשולש? (הבסיס ${m(base)} ס"מ, הגובה ${m(height)} ס"מ)`,
      answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
      hints: [
        'שטח משולש. בציור יש שלושה מספרים, אבל לא כולם נחוצים.',
        'משולש הוא חצי ממלבן עם אותו בסיס ואותו גובה. לכן: בסיס × גובה ÷ 2. הגובה הוא הקו המקווקו שיוצר זווית ישרה עם הבסיס, לא הצלע המשופעת.',
        `${m(`${base} × ${height} ÷ 2`)} = ?`,
      ],
      solution: [`${m(`${base} × ${height} ÷ 2 = ${ans}`)} סמ"ר`],
      mistakes: mistakes(isNum(ans), [numMistake(base * height, 'שכחת לחלק ב-2. משולש הוא חצי מלבן.'), numMistake((base * side) / 2, 'השתמשת בצלע המשופעת. בשטח משתמשים בגובה, שמאונך לבסיס.')]),
      visual: { type: 'shape', kind: 'triangle', labels: { base: String(base), height: String(height), side: String(side) } },
    };
  }
  const tri = rng() < 0.5;
  const known = int(rng, 3, 14);
  const unknown = int(rng, 2, 12);
  const A = tri ? (known * unknown) / 2 : known * unknown;
  if (!Number.isInteger(A)) return basic(level, rng);
  return {
    subtopicId: id,
    level,
    prompt: tri
      ? `שטח משולש הוא ${m(A)} סמ"ר והבסיס שלו ${m(known)} ס"מ. מה הגובה לבסיס?`
      : `שטח מלבן הוא ${m(A)} סמ"ר ואורכו ${m(known)} ס"מ. מה רוחבו?`,
    answer: { kind: 'number', value: unknown, unit: 'ס"מ' },
    hints: [
      'הפעם ידוע השטח, וחסרה מידה אחת. הולכים אחורה בנוסחה.',
      tri ? 'בסיס × גובה ÷ 2 = שטח. לכן בסיס × גובה = שטח × 2. משם מחלקים בבסיס.' : 'אורך × רוחב = שטח. איזה מספר כפול האורך נותן את השטח? מחלקים.',
      tri ? `בסיס × גובה = ${m(`${A} × 2 = ${A * 2}`)}` : `חלקי את השטח באורך: ${m(`${A} ÷ ${known}`)}`,
    ],
    solution: tri ? [`${m(`${A} × 2 = ${A * 2}`)}`, `${m(`${A * 2} ÷ ${known} = ${unknown}`)} ס"מ`] : [`${m(`${A} ÷ ${known} = ${unknown}`)} ס"מ`],
    mistakes: mistakes(isNum(unknown), tri ? [numMistake(A / known, 'שכחת שבמשולש מחלקים ב-2. קודם כופלים את השטח ב-2.')] : []),
  };
}

// ---------- area.quads ----------
function quads(level: Level, rng: Rng): Exercise {
  const id = 'area.quads';
  if (level === 1) {
    const base = int(rng, 4, 15);
    const h = int(rng, 3, 10);
    const side = h + int(rng, 1, 4);
    const ans = base * h;
    return {
      subtopicId: id,
      level,
      prompt: `מה השטח של המקבילית? (בסיס ${m(base)} ס"מ, גובה ${m(h)} ס"מ, צלע משופעת ${m(side)} ס"מ)`,
      answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
      hints: [
        'מקבילית: לא כל הנתונים נחוצים לשטח.',
        'אם חותכים משולש מצד אחד ומעבירים לצד השני, המקבילית נהיית מלבן עם אותו בסיס ואותו גובה. לכן שטח = בסיס × גובה. הצלע המשופעת לא משתתפת.',
        `${m(`${base} × ${h}`)} = ?`,
      ],
      solution: [`${m(`${base} × ${h} = ${ans}`)} סמ"ר`],
      mistakes: mistakes(isNum(ans), [numMistake(base * side, 'השתמשת בצלע המשופעת במקום בגובה. הגובה הוא הקו המקווקו, המאונך לבסיס.'), numMistake(ans / 2, 'חילקת ב-2, כמו במשולש. מקבילית היא מלבן "מוזז", בלי חלוקה.')]),
      visual: { type: 'shape', kind: 'parallelogram', labels: { base: String(base), height: String(h), side: String(side) } },
    };
  }
  if (level === 2) {
    const a = int(rng, 3, 12);
    const b = a + int(rng, 2, 8);
    let h = int(rng, 2, 10);
    if (((a + b) * h) % 2) h++;
    const ans = ((a + b) * h) / 2;
    return {
      subtopicId: id,
      level,
      prompt: `מה השטח של הטרפז? (בסיסים ${m(a)} ס"מ ו-${m(b)} ס"מ, גובה ${m(h)} ס"מ)`,
      answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
      hints: [
        'בטרפז יש שני בסיסים מקבילים באורכים שונים.',
        'רעיון: לוקחים את "הבסיס הממוצע" (סכום הבסיסים חלקי 2) וכופלים בגובה. כאילו הטרפז הוא מלבן עם בסיס ממוצע.',
        `${m(`(${a} + ${b}) × ${h} ÷ 2`)}`,
      ],
      solution: [`${m(`${a} + ${b} = ${a + b}`)}`, `${m(`${a + b} × ${h} ÷ 2 = ${ans}`)} סמ"ר`],
      mistakes: mistakes(isNum(ans), [numMistake((a + b) * h, 'שכחת לחלק ב-2.'), numMistake(a * b * h, 'כפלת את הבסיסים. בטרפז **מחברים** אותם.')]),
      visual: { type: 'shape', kind: 'trapezoid', labels: { top: String(a), bottom: String(b), height: String(h) } },
    };
  }
  let d1 = int(rng, 4, 16);
  const d2 = int(rng, 4, 16);
  if ((d1 * d2) % 2) d1++;
  const ans = (d1 * d2) / 2;
  return {
    subtopicId: id,
    level,
    prompt: `מה השטח של מעוין שאורכי האלכסונים שלו ${m(d1)} ס"מ ו-${m(d2)} ס"מ?`,
    answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
    hints: [
      'מעוין עם אלכסונים. האלכסונים מאונכים זה לזה.',
      'אפשר לחסום את המעוין במלבן שהצלעות שלו הן האלכסונים. המעוין תופס בדיוק חצי מהמלבן. לכן: אלכסון × אלכסון ÷ 2.',
      `${m(`${d1} × ${d2} ÷ 2`)}`,
    ],
    solution: [`${m(`${d1} × ${d2} ÷ 2 = ${ans}`)} סמ"ר`],
    mistakes: mistakes(isNum(ans), [numMistake(d1 * d2, 'שכחת לחלק ב-2. המעוין הוא חצי מהמלבן שנבנה על האלכסונים.')]),
    visual: { type: 'shape', kind: 'rhombus', labels: { d1: String(d1), d2: String(d2) } },
  };
}

// ---------- area.circle ----------
function circle(level: Level, rng: Rng): Exercise {
  const id = 'area.circle';
  const r = int(rng, 2, 12);
  if (level === 1) {
    const ans = r2(2 * PI * r);
    return {
      subtopicId: id,
      level,
      prompt: `מה ההיקף של מעגל שהרדיוס שלו ${m(r)} ס"מ? ${PI_NOTE}`,
      answer: { kind: 'number', value: ans, unit: 'ס"מ', tolerance: 0.011 },
      hints: [
        'היקף = האורך של הקו שמסביב לעיגול, כאילו מותחים חוט סביבו.',
        'ההיקף הוא בערך פי 3.14 (π) מהקוטר, והקוטר הוא פעמיים הרדיוס. לכן: 2 × π × r.',
        `${m(`2 × 3.14 × ${r}`)}`,
      ],
      solution: [`${m(`2 × 3.14 × ${r} = ${fmt(ans)}`)} ס"מ`],
      mistakes: mistakes(isNum(ans), [numMistake(r2(PI * r), 'חישבת π × רדיוס. ההיקף הוא π × **קוטר**, כלומר 2 × π × r.'), numMistake(r2(PI * r * r), 'זה השטח. ההיקף הוא 2 × π × r.')]),
      visual: { type: 'shape', kind: 'circle', labels: { r: `r = ${r}` } },
    };
  }
  if (level === 2) {
    const ans = r2(PI * r * r);
    return {
      subtopicId: id,
      level,
      prompt: `מה השטח של עיגול שהרדיוס שלו ${m(r)} ס"מ? ${PI_NOTE}`,
      answer: { kind: 'number', value: ans, unit: 'סמ"ר', tolerance: 0.011 },
      hints: [
        'מחפשים שטח, את כל מה שבתוך העיגול. לא את ההיקף.',
        'שטח עיגול = π × r × r (הרדיוס בריבוע). קודם הרדיוס בריבוע, אחר כך כפול 3.14.',
        `${m(`${r}² = ${r * r}`)}. עכשיו כפול 3.14.`,
      ],
      solution: [`${m(`3.14 × ${r}² = 3.14 × ${r * r} = ${fmt(ans)}`)} סמ"ר`],
      mistakes: mistakes(isNum(ans), [numMistake(r2(2 * PI * r), 'זה ההיקף. השטח הוא π × r².'), numMistake(r2(PI * 2 * r), 'כפלת ב-2 במקום להעלות בריבוע. השטח: π × r × r.')]),
      visual: { type: 'shape', kind: 'circle', labels: { r: `r = ${r}` } },
    };
  }
  const d = 2 * r;
  const ans = r2(PI * r * r);
  return {
    subtopicId: id,
    level,
    prompt: `שולחן עגול בקוטר ${m(d)} דצ"מ. מה שטח השולחן, בדצ"מ רבועים? ${PI_NOTE}`,
    answer: { kind: 'number', value: ans, unit: 'דצ"מ²', tolerance: 0.011 },
    hints: [
      'נתון **קוטר**, והנוסחה של השטח משתמשת ב**רדיוס**. זו המלכודת בשאלה.',
      'הרדיוס הוא חצי מהקוטר. קודם מוצאים אותו, ואז שטח = π × r².',
      `הרדיוס: ${m(`${d} ÷ 2 = ${r}`)}`,
    ],
    solution: [`${m(`r = ${r}`)}`, `${m(`3.14 × ${r}² = ${fmt(ans)}`)}`],
    mistakes: mistakes(isNum(ans), [numMistake(r2(PI * d * d), 'השתמשת בקוטר במקום ברדיוס. הרדיוס הוא חצי מהקוטר.')]),
    visual: { type: 'shape', kind: 'circle', labels: { d: `d = ${d}` } },
  };
}

// ---------- area.composite ----------
function composite(level: Level, rng: Rng): Exercise {
  const id = 'area.composite';
  if (level === 1 || level === 3) {
    // L-shape: total W × H, with a notch removed at the top right.
    const W = int(rng, 8, 16);
    const H = int(rng, 6, 12);
    const topW = int(rng, 3, W - 3);
    const lowH = int(rng, 2, H - 2);
    const area = topW * H + (W - topW) * lowH;
    if (level === 1) {
      return {
        subtopicId: id,
        level,
        prompt: `מה השטח של הצורה? (כל הזוויות ישרות. המידות בס"מ)`,
        answer: { kind: 'number', value: area, unit: 'סמ"ר' },
        hints: [
          'זו לא צורה שיש לה נוסחה אחת. אבל אפשר לפרק אותה לצורות מוכרות.',
          'מחלקים את הצורה לשני מלבנים (חותכים בקו אנכי או אופקי), מחשבים כל שטח, ומחברים. דרך אחרת: מלבן גדול פחות החלק החסר.',
          `מלבן שמאלי: ${m(`${topW} × ${H}`)}. ומה המידות של המלבן הימני?`,
        ],
        solution: [`שמאלי: ${m(`${topW} × ${H} = ${topW * H}`)}`, `ימני: ${m(`${W - topW} × ${lowH} = ${(W - topW) * lowH}`)}`, `סך הכול: ${m(area)} סמ"ר`],
        mistakes: mistakes(isNum(area), [numMistake(W * H, 'זה השטח של המלבן הגדול כולו. צריך להוריד את החלק החסר בפינה.')]),
        visual: { type: 'shape', kind: 'lshape', labels: { top: String(topW), bottom: String(W), left: String(H), right: String(lowH) } },
      };
    }
    // level 3: perimeter-free version with only some lengths given → needs deduction
    return {
      subtopicId: id,
      level,
      prompt: `מה השטח של הצורה? (כל הזוויות ישרות. רוחב כולל ${m(W)}, גובה כולל ${m(H)}, החלק החסר בפינה: ${m(W - topW)} × ${m(H - lowH)}. המידות בס"מ)`,
      answer: { kind: 'number', value: area, unit: 'סמ"ר' },
      hints: [
        'מכירים את המלבן הגדול ואת החור שבפינה.',
        'הדרך הקצרה: שטח המלבן הגדול, פחות שטח המלבן החסר.',
        `${m(`${W} × ${H} − ${W - topW} × ${H - lowH}`)}`,
      ],
      solution: [`${m(`${W} × ${H} = ${W * H}`)}`, `${m(`${W - topW} × ${H - lowH} = ${(W - topW) * (H - lowH)}`)}`, `${m(`${W * H} − ${(W - topW) * (H - lowH)} = ${area}`)} סמ"ר`],
      mistakes: mistakes(isNum(area), [numMistake(W * H + (W - topW) * (H - lowH), 'הוספת את החלק החסר במקום להוריד אותו.')]),
      visual: { type: 'shape', kind: 'lshape', labels: { bottom: String(W), left: String(H) } },
    };
  }
  const W = int(rng, 8, 16);
  const H = int(rng, 6, 12);
  const iw = int(rng, 2, W - 3);
  const ih = int(rng, 2, H - 3);
  const ans = W * H - iw * ih;
  return {
    subtopicId: id,
    level,
    prompt: `לתמונה מלבנית יש מסגרת. כל התמונה עם המסגרת: ${m(W)} × ${m(H)} ס"מ. התמונה עצמה: ${m(iw)} × ${m(ih)} ס"מ. מה שטח המסגרת?`,
    answer: { kind: 'number', value: ans, unit: 'סמ"ר' },
    hints: [
      'המסגרת היא "טבעת" סביב התמונה. אין לה נוסחה ישירה.',
      'שטח המסגרת = השטח של הכול, פחות השטח של התמונה שבפנים.',
      `הכול: ${m(`${W} × ${H}`)}. התמונה: ${m(`${iw} × ${ih}`)}.`,
    ],
    solution: [`${m(`${W} × ${H} = ${W * H}`)}`, `${m(`${iw} × ${ih} = ${iw * ih}`)}`, `${m(`${W * H} − ${iw * ih} = ${ans}`)} סמ"ר`],
    mistakes: mistakes(isNum(ans), [numMistake(W * H, 'זה השטח של הכול. צריך להוריד את התמונה שבאמצע.'), numMistake(iw * ih, 'זה שטח התמונה. המסגרת היא מה שמסביב.')]),
    visual: { type: 'shape', kind: 'frame', labels: { w: String(W), h: String(H), iw: String(iw), ih: String(ih) } },
  };
}

// ---------- area.perimeter ----------
function perimeter(level: Level, rng: Rng): Exercise {
  const id = 'area.perimeter';
  const w = int(rng, 3, 20);
  const h = int(rng, 2, 15);
  if (level === 1) {
    const ans = 2 * (w + h);
    return {
      subtopicId: id,
      level,
      prompt: `מה ההיקף של מלבן שאורכו ${m(w)} ס"מ ורוחבו ${m(h)} ס"מ?`,
      answer: { kind: 'number', value: ans, unit: 'ס"מ' },
      hints: [
        'היקף = האורך של כל הקו שמסביב לצורה, כמו גדר סביב גינה.',
        'למלבן יש ארבע צלעות: שתיים באורך ושתיים ברוחב. מחברים את כולן.',
        `${m(`${w} + ${h} + ${w} + ${h}`)}`,
      ],
      solution: [`${m(`2 × (${w} + ${h}) = ${ans}`)} ס"מ`],
      mistakes: mistakes(isNum(ans), [numMistake(w * h, 'זה השטח. ההיקף הוא סכום הצלעות.'), numMistake(w + h, 'חיברת רק שתי צלעות. למלבן יש ארבע.')]),
      visual: { type: 'shape', kind: 'rect', labels: { w: String(w), h: String(h) } },
    };
  }
  if (level === 2) {
    const P = 2 * (w + h);
    return {
      subtopicId: id,
      level,
      prompt: `היקף של מלבן הוא ${m(P)} ס"מ, ואורכו ${m(w)} ס"מ. מה רוחבו?`,
      answer: { kind: 'number', value: h, unit: 'ס"מ' },
      hints: [
        'ידוע ההיקף ואחת הצלעות. הולכים אחורה.',
        'בהיקף יש פעמיים אורך ופעמיים רוחב. מורידים את שני האורכים, ומה שנשאר הוא שני רוחבים.',
        `${m(`${P} − 2 × ${w} = ${P - 2 * w}`)}. זה שני רוחבים.`,
      ],
      solution: [`${m(`${P} − ${2 * w} = ${P - 2 * w}`)}`, `${m(`${P - 2 * w} ÷ 2 = ${h}`)} ס"מ`],
      mistakes: mistakes(isNum(h), [numMistake(P - w, 'הורדת רק אורך אחד. בהיקף יש שני אורכים.'), numMistake(P / 2 - w + w, 'זה חצי מההיקף, אורך ועוד רוחב. צריך להוריד ממנו את האורך.'), numMistake(P - 2 * w, 'זה שני רוחבים. חלקי ב-2.')]),
    };
  }
  const W = int(rng, 8, 16);
  const H = int(rng, 6, 12);
  const topW = int(rng, 3, W - 3);
  const lowH = int(rng, 2, H - 2);
  const ans = 2 * (W + H);
  return {
    subtopicId: id,
    level,
    prompt: `מה ההיקף של הצורה? (כל הזוויות ישרות. המידות בס"מ)`,
    answer: { kind: 'number', value: ans, unit: 'ס"מ' },
    hints: [
      'צריך לחבר את כל הצלעות, אבל לשתיים מהן לא כתוב אורך.',
      'טריק: אם "מזיזים" את המדרגה החוצה, הצורה נהיית מלבן עם אותו היקף בדיוק. כל הצלעות האופקיות למעלה מצטרפות לרוחב הכולל, וכל האנכיות מימין לגובה הכולל.',
      `ההיקף שווה להיקף של מלבן ${m(`${W} × ${H}`)}.`,
    ],
    solution: [`הצלעות החסרות: ${m(`${W} − ${topW} = ${W - topW}`)} ו-${m(`${H} − ${lowH} = ${H - lowH}`)}.`, `סכום: ${m(`2 × (${W} + ${H}) = ${ans}`)} ס"מ`],
    mistakes: mistakes(isNum(ans), [numMistake(topW + W + H + lowH, 'חיברת רק את הצלעות שכתוב עליהן מספר. יש עוד שתי צלעות במדרגה.')]),
    visual: { type: 'shape', kind: 'lshape', labels: { top: String(topW), bottom: String(W), left: String(H), right: String(lowH) } },
  };
}

export const areaUnit: UnitContent = {
  hook: {
    title: 'מספריים ודבק',
    text: 'כמעט כל נוסחת שטח באה מאותו רעיון: לחתוך את הצורה ולסדר מחדש כמלבן. מקבילית? חותכים משולש ומעבירים אותו לצד השני. משולש? חצי ממלבן. מי שמבינה את הרעיון, לא צריכה לשנן.',
  },
  tricks: ['שטח = מה שבפנים (סמ"ר). היקף = הגדר מסביב (ס"מ).', 'כל שטח "חוזר למלבן".', 'גובה תמיד מאונך לבסיס, לא הצלע המשופעת.', 'עיגול: היקף {{2πr}}, שטח {{πr²}}.'],
  commonMistakes: [
    { title: 'צלע במקום גובה', text: 'במקבילית ובמשולש, משתמשים בגובה (הקו המקווקו), לא בצלע המשופעת.' },
    { title: 'לשכוח ÷ 2', text: 'משולש, טרפז ומעוין: כולם עם חלוקה ב-2.' },
    { title: 'קוטר ורדיוס', text: 'אם נתון קוטר, חלקי ב-2 לפני שמשתמשים בנוסחה.' },
  ],
  subtopics: [
    {
      id: 'area.basic',
      title: 'מלבן, ריבוע ומשולש',
      addedIn: V,
      generate: basic,
      explanations: [
        {
          label: 'משבצות',
          title: 'שטח = כמה משבצות',
          paragraphs: ['במלבן 5 × 3 יש 3 שורות של 5 משבצות: {{5 × 3 = 15}} סמ"ר.', 'משולש הוא בדיוק חצי ממלבן עם אותו בסיס ואותו גובה: {{בסיס × גובה ÷ 2}}.'],
        },
        {
          label: 'גובה',
          title: 'מה זה גובה?',
          paragraphs: ['הגובה הוא המרחק הישר מהקודקוד אל הבסיס, בזווית ישרה.', 'הוא לא תמיד אחת הצלעות. בציורים הוא מסומן בקו מקווקו.'],
        },
      ],
    },
    {
      id: 'area.quads',
      title: 'מקבילית, טרפז ומעוין',
      addedIn: V,
      generate: quads,
      explanations: [
        {
          label: 'חיתוך',
          title: 'מקבילית = מלבן מוזז',
          interactive: 'parallelogramCut',
          paragraphs: ['חותכים משולש מצד אחד ומעבירים לצד השני, ומקבלים מלבן.', 'לכן שטח מקבילית = בסיס × גובה.'],
        },
        {
          label: 'טרפז ומעוין',
          title: 'טרפז ומעוין',
          paragraphs: ['**טרפז:** {{(בסיס + בסיס) × גובה ÷ 2}}. שני טרפזים זהים, אחד הפוך, יוצרים מקבילית.', '**מעוין:** {{אלכסון × אלכסון ÷ 2}}. המעוין הוא חצי מהמלבן שנבנה על האלכסונים.'],
        },
      ],
    },
    {
      id: 'area.circle',
      title: 'עיגול: היקף ושטח',
      addedIn: V,
      generate: circle,
      explanations: [
        {
          label: 'π',
          title: 'המספר π',
          paragraphs: ['בכל עיגול, ההיקף גדול פי 3.14 בערך מהקוטר. המספר הזה נקרא π (פאי).', 'היקף = π × קוטר = {{2 × π × r}}.', 'שטח = {{π × r²}}.'],
        },
        {
          label: 'פיצה',
          title: 'למה שטח העיגול הוא π × r²?',
          paragraphs: ['חותכים פיצה להרבה משולשים דקים, ומסדרים אותם הפוך-ישר בשורה.', 'מתקבלת צורה שדומה למלבן: האורך שלה חצי היקף ({{π × r}}) והגובה שלה r.', 'שטח: {{π × r × r}}.'],
        },
      ],
    },
    {
      id: 'area.composite',
      title: 'צורות מורכבות',
      addedIn: V,
      generate: composite,
      explanations: [
        {
          label: 'פירוק',
          title: 'לפרק לחלקים מוכרים',
          paragraphs: ['צורה מסובכת? חותכים אותה למלבנים ולמשולשים, מחשבים כל חלק ומחברים.'],
        },
        {
          label: 'להוריד',
          title: 'הכול פחות החור',
          paragraphs: ['לפעמים קל יותר להשלים למלבן גדול, ולהוריד את מה שחסר.', 'מסגרת, חצר עם בריכה, צורת L: הכול פחות החור.'],
        },
      ],
    },
    {
      id: 'area.perimeter',
      title: 'היקפים',
      addedIn: V,
      generate: perimeter,
      explanations: [
        {
          label: 'גדר',
          title: 'היקף = גדר',
          paragraphs: ['היקף הוא האורך של כל הקו מסביב, ונמדד בס"מ (לא בסמ"ר).', 'מלבן: {{2 × (אורך + רוחב)}}.'],
        },
        {
          label: 'מדרגות',
          title: 'טריק המדרגות',
          paragraphs: ['בצורת L או "מדרגות", ההיקף שווה להיקף המלבן שמקיף אותה.', 'אם "דוחפים" את המדרגות החוצה, אורך הגדר לא משתנה.'],
        },
      ],
    },
  ],
};
