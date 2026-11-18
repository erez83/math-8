import { useState } from 'react';
import type { VisualSpec } from '../content/types';
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

export function InteractiveVisual({ kind }: { kind: 'smoothie' | 'zoom' | 'boxes' }) {
  if (kind === 'smoothie') return <SmoothieVisual />;
  if (kind === 'zoom') return <ZoomVisual />;
  return <BoxesVisual />;
}
