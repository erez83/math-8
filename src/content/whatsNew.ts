/** "What's new" entries, newest first. Add one for every update. */
export interface WhatsNewEntry {
  version: string;
  date: string;
  items: string[];
}

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    version: '0.2.0',
    date: '21.11.2026',
    items: [
      'רמזים חדשים שמלמדים איך לחשוב: מה שואלים? איך חושבים? והצעד הראשון',
      'מסך "היכולות שלי": מפת שליטה בכל הנושאים, גרף שבועי, שיפורים והישגים',
    ],
  },
  {
    version: '0.1.0',
    date: '18.11.2026',
    items: [
      'שלוש יחידות ראשונות: יחס, יחסים שווים (צמצום והרחבה), חלוקה ביחס',
      'הסברים בכמה דרכים, הדמיות, טריקים וטעויות נפוצות',
      'תרגול בשלוש רמות ובוחן לכל יחידה',
      'גיבוי ושחזור של ההתקדמות בהגדרות',
    ],
  },
];

/** Compares versions like "0.10.2" > "0.9.0". */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}
