import { useState } from 'react';
import type { ExplanationVariant, VisualSpec } from '../content/types';
import { gcd } from '../lib/random';

const COLOR = { a: 'var(--c-a)', b: 'var(--c-b)', c: 'var(--c-c)' } as const;
const BOX_COLORS = ['var(--c-a)', 'var(--c-b)', 'var(--c-c)'];

/** Static visual attached to an exercise. */
export function ExerciseVisual({ spec }: { spec: VisualSpec }) {
  if (spec.type === 'bars') {
    // Dots in rows, mixed order so counting matters.
    const dots: string[] = [];
    spec.groups.forEach((g) => {
      for (let i = 0; i < g.count; i++) dots.push(COLOR[g.color]);
    });
    // Deterministic interleave.
    const mixed = dots.map((c, i) => ({ c, key: (i * 7) % dots.length })).sort((x, y) => x.key - y.key);
    const perRow = 8;
    const rows = Math.ceil(mixed.length / perRow);
    return (
      <div className="visual" aria-hidden>
        <svg viewBox={`0 0 ${perRow * 36} ${rows * 36}`} style={{ maxWidth: 320, margin: '0 auto' }}>
          {mixed.map((d, i) => (
            <circle key={i} cx={18 + (i % perRow) * 36} cy={18 + Math.floor(i / perRow) * 36} r={13} fill={d.c} />
          ))}
        </svg>
      </div>
    );
  }
  return <BarModel parts={spec.parts} labels={spec.labels} />;
}

/** A row of equal boxes per person: the "box method". */
export function BarModel({ parts, labels, perBox }: { parts: number[]; labels: string[]; perBox?: number }) {
  const maxParts = Math.max(...parts);
  const box = Math.min(44, 260 / maxParts);
  const labelW = 70;
  const w = labelW + maxParts * (box + 4) + 8;
  const rowH = box + 12;
  return (
    <div className="visual">
      <svg viewBox={`0 0 ${w} ${parts.length * rowH + 4}`} style={{ maxWidth: 420, margin: '0 auto' }} direction="rtl">
        {parts.map((p, i) => (
          <g key={i} transform={`translate(0 ${i * rowH + 4})`}>
            <text x={w - 4} y={box / 2 + 5} textAnchor="start" fontSize="14" fill="var(--text)" style={{ direction: 'rtl' }}>
              {labels[i]}
            </text>
            {Array.from({ length: p }, (_, j) => (
              <g key={j}>
                <rect x={w - labelW - (j + 1) * (box + 4)} y={0} width={box} height={box} rx={6} fill={BOX_COLORS[i % 3]} opacity={0.9} />
                {perBox !== undefined && (
                  <text x={w - labelW - (j + 1) * (box + 4) + box / 2} y={box / 2 + 5} textAnchor="middle" fontSize={box > 34 ? 13 : 10} fill="#fff" fontWeight={700}>
                    {perBox}
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <span>
      <span className="muted small">{label} </span>
      <span className="stepper">
        <button onClick={() => onChange(Math.max(min, value - 1))} aria-label="הקטנה">−</button>
        <span>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} aria-label="הגדלה">+</button>
      </span>
    </span>
  );
}

/** Smoothie: 2 cups strawberry per 1 cup banana; servings change, ratio stays. */
export function SmoothieVisual() {
  const [n, setN] = useState(1);
  const straw = 2 * n;
  const banana = n;
  const cup = (x: number, y: number, color: string, key: string) => (
    <g key={key} transform={`translate(${x} ${y})`}>
      <path d="M2 0 L26 0 L22 34 L6 34 Z" fill={color} opacity={0.9} />
    </g>
  );
  const perRow = 10;
  const items = [...Array(straw).fill('var(--bad)'), ...Array(banana).fill('var(--c-a)')];
  const rows = Math.ceil(items.length / perRow);
  return (
    <div className="card visual">
      <svg viewBox={`0 0 ${perRow * 32} ${rows * 42}`} style={{ maxWidth: 340, margin: '0 auto' }}>
        {items.map((c, i) => cup((i % perRow) * 32 + 2, Math.floor(i / perRow) * 42 + 4, c, String(i)))}
      </svg>
      <div className="legend">
        <span><span className="dot" style={{ background: 'var(--bad)' }} />תות: {straw}</span>
        <span><span className="dot" style={{ background: 'var(--c-a)' }} />בננה: {banana}</span>
      </div>
      <div className="control">
        <Stepper label="מנות" value={n} min={1} max={6} onChange={setN} />
      </div>
      <p className="muted small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        תות:בננה = <span className="math">{straw}:{banana}</span> = <span className="math">2:1</span>, בכל מספר מנות.
      </p>
    </div>
  );
}

/** Zoom: two rectangles keep their proportion while scaling. */
export function ZoomVisual() {
  const [a, b] = [2, 3];
  const [k, setK] = useState(2);
  const unit = 100 / (Math.max(a, b) * 6);
  const wa = a * k * unit * 2;
  const wb = b * k * unit * 2;
  return (
    <div className="card visual">
      <svg viewBox="0 0 220 110" style={{ maxWidth: 360, margin: '0 auto' }}>
        <rect x={10} y={10} width={wa} height={36} rx={6} fill="var(--c-a)" />
        <rect x={10} y={58} width={wb} height={36} rx={6} fill="var(--c-b)" />
      </svg>
      <div className="control">
        <Stepper label="פי" value={k} min={1} max={6} onChange={setK} />
      </div>
      <p className="muted small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        <span className="math">{a * k}:{b * k}</span>
        {k > 1 && (
          <>
            {' '}← מצמצמים ב-<span className="math">{k}</span> → <span className="math">{a}:{b}</span>
          </>
        )}
        {k === 1 && ' (היחס המצומצם)'}
      </p>
    </div>
  );
}

/** Boxes: choose total and ratio, see the value per box. */
export function BoxesVisual() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [perBox, setPerBox] = useState(20);
  const total = (a + b) * perBox;
  return (
    <div className="card visual">
      <BarModel parts={[a, b]} labels={['נועה', 'איתי']} perBox={perBox} />
      <div className="control">
        <Stepper label="נועה" value={a} min={1} max={6} onChange={setA} />
        <Stepper label="איתי" value={b} min={1} max={6} onChange={setB} />
      </div>
      <div className="control">
        <span className="muted small">סכום לחלוקה:</span>
        <span className="stepper">
          <button onClick={() => setPerBox(Math.max(5, perBox - 5))} aria-label="הקטנה">−</button>
          <span style={{ minWidth: 52 }}>{total}</span>
          <button onClick={() => setPerBox(Math.min(60, perBox + 5))} aria-label="הגדלה">+</button>
        </span>
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '10px 0 0' }}>
        <span className="math">{a} + {b} = {a + b}</span> קופסאות · קופסה ={' '}
        <span className="math">{total} ÷ {a + b} = {perBox}</span>
        <br />
        נועה <span className="math">{a * perBox}</span> · איתי <span className="math">{b * perBox}</span>
        {gcd(a, b) > 1 && <span className="muted"> (אפשר לצמצם את היחס!)</span>}
      </p>
    </div>
  );
}

/** Percent = "out of 100": a 10×10 grid, tap +/- to color squares. */
export function PercentGridVisual() {
  const [p, setP] = useState(25);
  const [n, setN] = useState(80);
  const value = (p * n) / 100;
  return (
    <div className="card visual">
      <svg viewBox="0 0 200 200" style={{ maxWidth: 220, margin: '0 auto' }} role="img" aria-label={`${p} מתוך 100`}>
        {Array.from({ length: 100 }, (_, i) => (
          <rect key={i} x={(i % 10) * 20 + 1} y={Math.floor(i / 10) * 20 + 1} width={18} height={18} rx={3} fill={i < p ? 'var(--c-b)' : 'var(--surface-2)'} />
        ))}
      </svg>
      <div className="control">
        <span>
          <span className="muted small">אחוז </span>
          <span className="stepper">
            <button onClick={() => setP(Math.max(0, p - 5))} aria-label="פחות">−</button>
            <span>{p}%</span>
            <button onClick={() => setP(Math.min(100, p + 5))} aria-label="יותר">+</button>
          </span>
        </span>
        <span>
          <span className="muted small">מתוך </span>
          <span className="stepper">
            <button onClick={() => setN(Math.max(20, n - 20))} aria-label="פחות">−</button>
            <span style={{ minWidth: 44 }}>{n}</span>
            <button onClick={() => setN(Math.min(400, n + 20))} aria-label="יותר">+</button>
          </span>
        </span>
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '10px 0 0' }}>
        {p}% = {p} משבצות מתוך 100.
        <br />
        מ-<span className="math">{n}</span>: כל משבצת שווה <span className="math">{n} ÷ 100 = {n / 100}</span>, אז{' '}
        <span className="math">{p}% = {Number.isInteger(value) ? value : value.toFixed(1)}</span>
      </p>
    </div>
  );
}

/** Equation as a balance: every step is done to BOTH sides. Example: 3x + 5 = 20. */
export function BalanceVisual() {
  const steps = [
    { left: '3x + 5', right: '20', note: 'המאזניים מאוזנים: שני הצדדים שווים.' },
    { left: '3x', right: '15', note: 'הורדנו 5 משני הצדדים. עדיין מאוזן.' },
    { left: 'x', right: '5', note: 'חילקנו את שני הצדדים ב-3. מצאנו: x = 5.' },
  ];
  const [i, setI] = useState(0);
  const s = steps[i];
  return (
    <div className="card visual">
      <svg viewBox="0 0 300 150" style={{ maxWidth: 360, margin: '0 auto' }} direction="ltr">
        <polygon points="150,140 135,150 165,150" fill="var(--text-2)" />
        <rect x="147" y="60" width="6" height="82" fill="var(--text-2)" />
        <rect x="30" y="56" width="240" height="6" rx="3" fill="var(--text-2)" />
        <line x1="60" y1="62" x2="60" y2="90" stroke="var(--text-2)" strokeWidth="2" />
        <line x1="240" y1="62" x2="240" y2="90" stroke="var(--text-2)" strokeWidth="2" />
        <rect x="10" y="90" width="100" height="36" rx="8" fill="var(--c-b)" />
        <rect x="190" y="90" width="100" height="36" rx="8" fill="var(--c-a)" />
        <text x="60" y="114" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">{s.left}</text>
        <text x="240" y="114" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">{s.right}</text>
      </svg>
      <p className="small" style={{ textAlign: 'center', margin: '6px 0' }}>
        <span className="math">{s.left} = {s.right}</span> · {s.note}
      </p>
      <div className="control">
        <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>→ אחורה</button>
        <button className="btn secondary" disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>
          {i === 0 ? 'מורידים 5 משני הצדדים' : 'מחלקים את שני הצדדים ב-3'} ←
        </button>
      </div>
    </div>
  );
}

/** Scale and area: lengths ×k make the area ×k². */
export function AreaScaleVisual() {
  const [k, setK] = useState(2);
  const cell = 120 / (3 * k);
  return (
    <div className="card visual">
      <svg viewBox="0 0 260 130" style={{ maxWidth: 360, margin: '0 auto' }} direction="ltr">
        <rect x="10" y={130 - 40 - 5} width="40" height="40" fill="var(--c-a)" rx="3" />
        <text x="30" y="80" textAnchor="middle" fontSize="11" fill="var(--text-2)">מקורי</text>
        {Array.from({ length: k * k }, (_, i) => (
          <rect key={i} x={110 + (i % k) * cell * 3 + 1} y={5 + Math.floor(i / k) * cell * 3 + 1} width={cell * 3 - 2} height={cell * 3 - 2} rx="2" fill="var(--c-b)" opacity={0.85} />
        ))}
      </svg>
      <div className="control">
        <Stepper label="הגדלה פי" value={k} min={1} max={4} onChange={setK} />
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        כל צלע גדלה פי <span className="math">{k}</span>, אבל נכנסים <span className="math">{k} × {k} = {k * k}</span> ריבועים מקוריים. השטח גדל פי{' '}
        <span className="math">{k * k}</span>.
      </p>
    </div>
  );
}

/** Ratio table: both rows are multiplied by the same number. */
export function RatioTableVisual() {
  const [k, setK] = useState(3);
  const base = [4, 10];
  return (
    <div className="card visual">
      <table className="rtable">
        <tbody>
          <tr>
            <th>מחברות</th>
            <td>{base[0]}</td>
            <td className="hl">{base[0] * k}</td>
          </tr>
          <tr>
            <th>מחיר (ש"ח)</th>
            <td>{base[1]}</td>
            <td className="hl">{base[1] * k}</td>
          </tr>
        </tbody>
      </table>
      <div className="control">
        <Stepper label="כפול" value={k} min={1} max={8} onChange={setK} />
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        <span className="math">{base[0]}:{base[1]} = {base[0] * k}:{base[1] * k}</span>. שתי השורות גדלות פי אותו מספר, וזו פרופורציה.
      </p>
    </div>
  );
}

export function InteractiveVisual({ kind }: { kind: NonNullable<ExplanationVariant['interactive']> }) {
  switch (kind) {
    case 'smoothie':
      return <SmoothieVisual />;
    case 'zoom':
      return <ZoomVisual />;
    case 'boxes':
      return <BoxesVisual />;
    case 'percentGrid':
      return <PercentGridVisual />;
    case 'balance':
      return <BalanceVisual />;
    case 'areaScale':
      return <AreaScaleVisual />;
    case 'ratioTable':
      return <RatioTableVisual />;
  }
}
