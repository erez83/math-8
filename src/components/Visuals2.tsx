/** Visuals for stage 3: graphs, tables, charts and geometric figures. */
import { useState, type ReactNode } from 'react';
import type { ShapeKind, VisualSpec } from '../content/types';
import { lineText } from '../content/helpers';

const C = ['var(--c-b)', 'var(--c-a)', 'var(--c-c)', 'var(--bad)', 'var(--text-2)'];
const fmtN = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// ---------- coordinate graph ----------
export function Graph({ lines = [], points = [], range = 6 }: { lines?: { m: number; b: number; label?: string }[]; points?: { x: number; y: number; label?: string }[]; range?: number }) {
  const size = 260;
  const s = size / (2 * range);
  const X = (x: number) => (x + range) * s;
  const Y = (y: number) => (range - y) * s;
  const ticks = Array.from({ length: 2 * range + 1 }, (_, i) => i - range);
  return (
    <svg viewBox={`-14 -6 ${size + 22} ${size + 20}`} style={{ maxWidth: 300, margin: '0 auto', display: 'block' }} direction="ltr" role="img" aria-label="גרף">
      <defs>
        <clipPath id="plot">
          <rect x="0" y="0" width={size} height={size} />
        </clipPath>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} y1={0} x2={X(t)} y2={size} stroke="var(--border)" strokeWidth={0.6} />
          <line x1={0} y1={Y(t)} x2={size} y2={Y(t)} stroke="var(--border)" strokeWidth={0.6} />
        </g>
      ))}
      <line x1={0} y1={Y(0)} x2={size} y2={Y(0)} stroke="var(--text-2)" strokeWidth={1.4} />
      <line x1={X(0)} y1={0} x2={X(0)} y2={size} stroke="var(--text-2)" strokeWidth={1.4} />
      {ticks
        .filter((t) => t !== 0 && t % 2 === 0)
        .map((t) => (
          <g key={'l' + t} fontSize="9" fill="var(--text-2)">
            <text x={X(t)} y={Y(0) + 11} textAnchor="middle">{t}</text>
            <text x={X(0) - 4} y={Y(t) + 3} textAnchor="end">{t}</text>
          </g>
        ))}
      <text x={size + 4} y={Y(0) + 4} fontSize="11" fill="var(--text-2)">x</text>
      <text x={X(0) + 4} y={-1} fontSize="11" fill="var(--text-2)">y</text>
      <g clipPath="url(#plot)">
        {lines.map((l, i) => (
          <line key={i} x1={X(-range)} y1={Y(l.m * -range + l.b)} x2={X(range)} y2={Y(l.m * range + l.b)} stroke={C[i % C.length]} strokeWidth={2.4} strokeLinecap="round" />
        ))}
      </g>
      {lines.map(
        (l, i) =>
          l.label && (
            <text key={'t' + i} x={i === 0 ? 6 : size - 6} y={i === 0 ? 14 : size - 8} textAnchor={i === 0 ? 'start' : 'end'} fontSize="12" fontWeight={700} fill={C[i % C.length]}>
              {l.label}
            </text>
          ),
      )}
      {points.map((p, i) => (
        <g key={'p' + i}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={4} fill="var(--text)" />
          {p.label && (
            <text x={X(p.x) + 6} y={Y(p.y) - 6} fontSize="11" fill="var(--text)" fontWeight={600}>
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ---------- table ----------
export function DataTable({ rows }: { rows: (string | number)[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="rtable">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <th>{row[0]}</th>
              {row.slice(1).map((c, j) => (
                <td key={j} className={c === '?' ? 'hl' : ''}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- bar chart ----------
export function BarChart({ labels, values, step, title }: { labels: string[]; values: number[]; step: number; title?: string }) {
  const max = Math.ceil(Math.max(...values) / step) * step;
  const H = 150;
  const W = 280;
  const left = 26;
  const bw = (W - left) / labels.length;
  const y = (v: number) => H - (v / max) * (H - 10);
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  return (
    <svg viewBox={`0 0 ${W} ${H + 34}`} style={{ maxWidth: 340, margin: '0 auto', display: 'block' }} direction="ltr" role="img" aria-label={title ?? 'דיאגרמת עמודות'}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={W} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={0.7} />
          <text x={left - 4} y={y(t) + 3} fontSize="9" textAnchor="end" fill="var(--text-2)">{t}</text>
        </g>
      ))}
      {values.map((v, i) => (
        <g key={i}>
          <rect x={left + i * bw + bw * 0.2} y={y(v)} width={bw * 0.6} height={H - y(v)} rx={3} fill={C[i % 3]} />
          <text x={left + i * bw + bw / 2} y={H + 16} fontSize="11" textAnchor="middle" fill="var(--text)" style={{ direction: 'rtl' }}>
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------- pie ----------
export function Pie({ labels, percents }: { labels: string[]; percents: number[] }) {
  let acc = 0;
  const arcs = percents.map((p) => {
    const a0 = (acc / 100) * 2 * Math.PI - Math.PI / 2;
    acc += p;
    const a1 = (acc / 100) * 2 * Math.PI - Math.PI / 2;
    const large = p > 50 ? 1 : 0;
    return `M 60 60 L ${60 + 55 * Math.cos(a0)} ${60 + 55 * Math.sin(a0)} A 55 55 0 ${large} 1 ${60 + 55 * Math.cos(a1)} ${60 + 55 * Math.sin(a1)} Z`;
  });
  const PIE = ['var(--c-b)', 'var(--c-a)', 'var(--c-c)', 'var(--bad)', 'var(--accent)'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 120 120" width={130} role="img" aria-label="דיאגרמת עוגה">
        {arcs.map((d, i) => (
          <path key={i} d={d} fill={PIE[i % PIE.length]} stroke="var(--surface)" strokeWidth={1.5} />
        ))}
      </svg>
      <div className="small">
        {labels.map((l, i) => (
          <div key={i}>
            <span className="dot" style={{ background: PIE[i % PIE.length] }} />
            {l}: <span className="math">{percents[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- right triangle ----------
export function RightTriangle({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <svg viewBox="0 0 220 150" style={{ maxWidth: 260, margin: '0 auto', display: 'block' }} direction="ltr" role="img" aria-label="משולש ישר-זווית">
      <polygon points="30,130 190,130 30,20" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
      <polyline points="30,116 44,116 44,130" fill="none" stroke="var(--accent)" strokeWidth={1.5} />
      <text x="110" y="146" textAnchor="middle" fontSize="14" fontWeight={700} fill="var(--text)">{a}</text>
      <text x="20" y="80" textAnchor="end" fontSize="14" fontWeight={700} fill="var(--text)">{b}</text>
      <text x="118" y="68" textAnchor="start" fontSize="14" fontWeight={700} fill="var(--c-a)">{c}</text>
    </svg>
  );
}

// ---------- shapes ----------
function Label({ x, y, t, anchor = 'middle' }: { x: number; y: number; t?: string; anchor?: 'start' | 'middle' | 'end' }) {
  if (!t) return null;
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="13" fontWeight={700} fill="var(--text)">
      {t}
    </text>
  );
}

export function Shape({ kind, labels: L }: { kind: ShapeKind; labels: Record<string, string> }) {
  const fill = 'var(--accent-soft)';
  const stroke = 'var(--accent)';
  const dash = { stroke: 'var(--c-a)', strokeWidth: 1.6, strokeDasharray: '4 3' };
  let body: ReactNode;
  switch (kind) {
    case 'rect':
      body = (
        <>
          <rect x="40" y="20" width="160" height="90" fill={fill} stroke={stroke} strokeWidth={2} />
          <Label x={120} y={128} t={L.w} />
          <Label x={32} y={70} t={L.h} anchor="end" />
        </>
      );
      break;
    case 'triangle':
      body = (
        <>
          <polygon points="30,110 210,110 140,20" fill={fill} stroke={stroke} strokeWidth={2} />
          <line x1="140" y1="20" x2="140" y2="110" {...dash} />
          <polyline points="140,100 150,100 150,110" fill="none" stroke="var(--c-a)" strokeWidth={1.2} />
          <Label x={120} y={128} t={L.base} />
          <Label x={146} y={70} t={L.height} anchor="start" />
          <Label x={70} y={58} t={L.side} anchor="end" />
        </>
      );
      break;
    case 'parallelogram':
      body = (
        <>
          <polygon points="30,110 170,110 210,20 70,20" fill={fill} stroke={stroke} strokeWidth={2} />
          <line x1="70" y1="20" x2="70" y2="110" {...dash} />
          <Label x={100} y={128} t={L.base} />
          <Label x={76} y={70} t={L.height} anchor="start" />
          <Label x={200} y={70} t={L.side} anchor="start" />
        </>
      );
      break;
    case 'trapezoid':
      body = (
        <>
          <polygon points="20,110 220,110 160,20 70,20" fill={fill} stroke={stroke} strokeWidth={2} />
          <line x1="70" y1="20" x2="70" y2="110" {...dash} />
          <Label x={115} y={14} t={L.top} />
          <Label x={120} y={128} t={L.bottom} />
          <Label x={76} y={70} t={L.height} anchor="start" />
        </>
      );
      break;
    case 'rhombus':
      body = (
        <>
          <polygon points="120,10 210,65 120,120 30,65" fill={fill} stroke={stroke} strokeWidth={2} />
          <line x1="30" y1="65" x2="210" y2="65" {...dash} />
          <line x1="120" y1="10" x2="120" y2="120" {...dash} />
          <Label x={165} y={60} t={L.d1} />
          <Label x={126} y={100} t={L.d2} anchor="start" />
        </>
      );
      break;
    case 'circle':
      body = (
        <>
          <circle cx="120" cy="65" r="55" fill={fill} stroke={stroke} strokeWidth={2} />
          <circle cx="120" cy="65" r="3" fill="var(--text)" />
          {L.r && <line x1="120" y1="65" x2="175" y2="65" {...dash} />}
          {L.d && <line x1="65" y1="65" x2="175" y2="65" {...dash} />}
          <Label x={148} y={58} t={L.r ?? L.d} />
        </>
      );
      break;
    case 'lshape':
      body = (
        <>
          <polygon points="30,20 110,20 110,70 210,70 210,120 30,120" fill={fill} stroke={stroke} strokeWidth={2} />
          <Label x={70} y={14} t={L.top} />
          <Label x={120} y={136} t={L.bottom} />
          <Label x={22} y={74} t={L.left} anchor="end" />
          <Label x={218} y={100} t={L.right} anchor="start" />
          <Label x={116} y={48} t={L.inner} anchor="start" />
          <Label x={160} y={64} t={L.step} />
        </>
      );
      break;
    case 'frame':
      body = (
        <>
          <rect x="30" y="15" width="180" height="105" fill={fill} stroke={stroke} strokeWidth={2} />
          <rect x="70" y="40" width="100" height="55" fill="var(--surface)" stroke={stroke} strokeWidth={1.5} />
          <Label x={120} y={136} t={L.w} />
          <Label x={22} y={70} t={L.h} anchor="end" />
          <Label x={120} y={88} t={L.iw} />
          <Label x={176} y={70} t={L.ih} anchor="start" />
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 240 142" style={{ maxWidth: 280, margin: '0 auto', display: 'block' }} direction="ltr" role="img" aria-label="צורה">
      {body}
    </svg>
  );
}

// ---------- box & cylinder ----------
export function Box({ length, width, height, diagonal }: { length: string; width: string; height: string; diagonal?: 'face' | 'main' }) {
  // Front face 40..170 x 50..130, depth offset (40, -30)
  return (
    <svg viewBox="0 0 240 150" style={{ maxWidth: 280, margin: '0 auto', display: 'block' }} direction="ltr" role="img" aria-label="תיבה">
      <polygon points="40,50 170,50 210,20 80,20" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.6} />
      <polygon points="170,50 210,20 210,100 170,130" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth={1.6} />
      <rect x="40" y="50" width="130" height="80" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
      <line x1="80" y1="20" x2="80" y2="100" stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" />
      <line x1="40" y1="130" x2="80" y2="100" stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" />
      <line x1="80" y1="100" x2="210" y2="100" stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" />
      {diagonal === 'face' && <line x1="40" y1="130" x2="170" y2="50" stroke="var(--c-a)" strokeWidth={2.4} />}
      {diagonal === 'main' && <line x1="40" y1="130" x2="210" y2="20" stroke="var(--c-a)" strokeWidth={2.4} />}
      <text x="105" y="146" textAnchor="middle" fontSize="13" fontWeight={700} fill="var(--text)">{length}</text>
      <text x="200" y="128" textAnchor="start" fontSize="13" fontWeight={700} fill="var(--text)">{width}</text>
      <text x="32" y="94" textAnchor="end" fontSize="13" fontWeight={700} fill="var(--text)">{height}</text>
    </svg>
  );
}

export function Cylinder({ r, h }: { r: string; h: string }) {
  return (
    <svg viewBox="0 0 200 160" style={{ maxWidth: 220, margin: '0 auto', display: 'block' }} direction="ltr" role="img" aria-label="גליל">
      <path d="M40 30 L40 125 A60 18 0 0 0 160 125 L160 30" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
      <ellipse cx="100" cy="30" rx="60" ry="18" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth={2} />
      <line x1="100" y1="30" x2="160" y2="30" stroke="var(--c-a)" strokeWidth={1.8} strokeDasharray="4 3" />
      <text x="130" y="24" textAnchor="middle" fontSize="13" fontWeight={700} fill="var(--text)">{r}</text>
      <text x="168" y="85" textAnchor="start" fontSize="13" fontWeight={700} fill="var(--text)">{h}</text>
    </svg>
  );
}

/** Dispatch for the stage-3 exercise visuals. */
export function Visual2({ spec }: { spec: VisualSpec }) {
  switch (spec.type) {
    case 'graph':
      return <Graph lines={spec.lines} points={spec.points} range={spec.range} />;
    case 'table':
      return <DataTable rows={spec.rows} />;
    case 'barChart':
      return <BarChart labels={spec.labels} values={spec.values} step={spec.step} title={spec.title} />;
    case 'pie':
      return <Pie labels={spec.labels} percents={spec.percents} />;
    case 'triangle':
      return <RightTriangle a={spec.a} b={spec.b} c={spec.c} />;
    case 'shape':
      return <Shape kind={spec.kind} labels={spec.labels} />;
    case 'box':
      return <Box length={spec.length} width={spec.width} height={spec.height} diagonal={spec.diagonal} />;
    case 'cylinder':
      return <Cylinder r={spec.r} h={spec.h} />;
    default:
      return null;
  }
}

// ---------- interactive explanations ----------
function Step({ label, value, set, min, max, show }: { label: string; value: number; set: (v: number) => void; min: number; max: number; show?: string }) {
  return (
    <span>
      <span className="muted small">{label} </span>
      <span className="stepper">
        <button onClick={() => set(Math.max(min, value - 1))} aria-label="הקטנה">−</button>
        <span>{show ?? value}</span>
        <button onClick={() => set(Math.min(max, value + 1))} aria-label="הגדלה">+</button>
      </span>
    </span>
  );
}


export function LineExplorer() {
  const [m, setM] = useState(1);
  const [b, setB] = useState(2);
  return (
    <div className="card visual">
      <Graph lines={[{ m, b }]} points={[{ x: 0, y: b, label: `(0, ${b})` }]} />
      <p style={{ textAlign: 'center', margin: '6px 0', fontWeight: 700 }}>
        <span className="math">{lineText(m, b)}</span>
      </p>
      <div className="control">
        <Step label="שיפוע m" value={m} set={setM} min={-3} max={3} />
        <Step label="b" value={b} set={setB} min={-4} max={4} />
      </div>
      <p className="muted small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        {m > 0 ? 'm חיובי: הישר עולה.' : m < 0 ? 'm שלילי: הישר יורד.' : 'm = 0: ישר אופקי.'} b זו הנקודה שבה הישר חותך את ציר y.
      </p>
    </div>
  );
}

export function MeanTowers() {
  const data = [2, 7, 4, 3];
  const [level, setLevel] = useState(false);
  const mean = data.reduce((s, v) => s + v, 0) / data.length;
  const cell = 16;
  return (
    <div className="card visual">
      <svg viewBox="0 0 200 140" style={{ maxWidth: 260, margin: '0 auto', display: 'block' }}>
        {data.map((v, i) => {
          const h = level ? mean : v;
          return Array.from({ length: h }, (_, j) => (
            <rect key={`${i}-${j}`} x={20 + i * 44} y={130 - (j + 1) * cell} width={36} height={cell - 2} rx={3} fill={level ? 'var(--ok)' : 'var(--c-b)'} />
          ));
        })}
        {level && <line x1="10" x2="190" y1={130 - mean * cell} y2={130 - mean * cell} stroke="var(--c-a)" strokeWidth={2} strokeDasharray="5 3" />}
      </svg>
      <div className="control">
        <button className="btn secondary" onClick={() => setLevel(!level)}>
          {level ? 'חזרה למגדלים' : 'ליישר את המגדלים ←'}
        </button>
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        {level ? (
          <>
            כל המגדלים בגובה <span className="math">{mean}</span>. זה הממוצע: <span className="math">(2 + 7 + 4 + 3) ÷ 4 = {mean}</span>
          </>
        ) : (
          'מגדלים בגבהים 2, 7, 4, 3. מה יקרה אם נעביר קוביות מהגבוהים לנמוכים עד שכולם שווים?'
        )}
      </p>
    </div>
  );
}

export function PythagorasSquares() {
  const [k, setK] = useState(1);
  const [a, b, c] = [3 * k, 4 * k, 5 * k];
  return (
    <div className="card visual">
      <svg viewBox="-10 -10 230 230" style={{ maxWidth: 260, margin: '0 auto', display: 'block' }} direction="ltr">
        {/* triangle with legs 3 (horizontal) and 4 (vertical), unit = 20 */}
        <g transform="translate(70 60)">
          <rect x="0" y="80" width="60" height="60" fill="var(--c-a)" opacity={0.75} />
          <rect x="-80" y="0" width="80" height="80" fill="var(--c-b)" opacity={0.75} />
          <polygon points="0,0 60,80 140,20 80,-60" fill="var(--c-c)" opacity={0.75} />
          <polygon points="0,0 0,80 60,80" fill="var(--surface)" stroke="var(--text)" strokeWidth={2} />
          <text x="30" y="115" textAnchor="middle" fontSize="13" fontWeight={700} fill="#fff">{a * a}</text>
          <text x="-40" y="45" textAnchor="middle" fontSize="13" fontWeight={700} fill="#fff">{b * b}</text>
          <text x="70" y="15" textAnchor="middle" fontSize="13" fontWeight={700} fill="#fff">{c * c}</text>
        </g>
      </svg>
      <div className="control">
        <Step label="הגדלה פי" value={k} set={setK} min={1} max={3} />
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        צלעות <span className="math">{a}, {b}, {c}</span>: <span className="math">{a}² + {b}² = {a * a} + {b * b} = {c * c} = {c}²</span>
      </p>
    </div>
  );
}

export function ParallelogramCut() {
  const [moved, setMoved] = useState(false);
  return (
    <div className="card visual">
      <svg viewBox="0 0 240 120" style={{ maxWidth: 300, margin: '0 auto', display: 'block' }} direction="ltr">
        <polygon points="60,20 60,100 180,100 220,20" fill="var(--accent-soft)" />
        <polygon points="60,20 60,100 20,100" fill="var(--c-a)" style={{ transition: 'transform 0.6s', transform: moved ? 'translateX(160px)' : 'none' }} />
        {!moved && <polygon points="20,100 180,100 220,20 60,20" fill="none" stroke="var(--accent)" strokeWidth={2} />}
        {moved && <rect x="60" y="20" width="160" height="80" fill="none" stroke="var(--accent)" strokeWidth={2} />}
        <line x1="60" y1="20" x2="60" y2="100" stroke="var(--c-a)" strokeDasharray="4 3" strokeWidth={1.6} />
      </svg>
      <div className="control">
        <button className="btn secondary" onClick={() => setMoved(!moved)}>
          {moved ? 'חזרה למקבילית' : 'לחתוך ולהזיז את המשולש ←'}
        </button>
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        {moved ? 'יצא מלבן! אותו בסיס, אותו גובה, אותו שטח: בסיס × גובה.' : 'חותכים משולש מצד אחד של המקבילית ומעבירים אותו לצד השני.'}
      </p>
    </div>
  );
}

export function BoxLayers() {
  const [layers, setLayers] = useState(1);
  const [w, d] = [4, 3];
  const cube = 18;
  return (
    <div className="card visual">
      <svg viewBox="0 0 240 150" style={{ maxWidth: 280, margin: '0 auto', display: 'block' }} direction="ltr">
        {Array.from({ length: layers }, (_, z) =>
          Array.from({ length: d }, (_, y) =>
            Array.from({ length: w }, (_, x) => {
              const px = 50 + x * cube + (d - 1 - y) * 9;
              const py = 120 - z * cube - (d - 1 - y) * 7;
              return <rect key={`${x}${y}${z}`} x={px} y={py} width={cube - 2} height={cube - 2} rx={2} fill={z % 2 ? 'var(--c-b)' : 'var(--c-a)'} opacity={0.85} stroke="var(--surface)" />;
            }),
          ),
        )}
      </svg>
      <div className="control">
        <Step label="שכבות (גובה)" value={layers} set={setLayers} min={1} max={4} />
      </div>
      <p className="small" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        בכל שכבה <span className="math">{w} × {d} = {w * d}</span> קוביות (שטח הבסיס). {layers} שכבות:{' '}
        <span className="math">{w * d} × {layers} = {w * d * layers}</span> קוביות = הנפח.
      </p>
    </div>
  );
}

export { fmtN };
