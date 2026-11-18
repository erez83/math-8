import { Fragment, type ReactNode } from 'react';

/**
 * Renders content text:
 *   {{...}}  -> math, left-to-right, with "a/b" drawn as a stacked fraction
 *   **...**  -> bold
 */
export function MathText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\{\{(.+?)\}\}|\*\*(.+?)\*\*/g;
  let last = 0;
  let k = 0;
  for (let mt = re.exec(text); mt; mt = re.exec(text)) {
    if (mt.index > last) out.push(<Fragment key={k++}>{text.slice(last, mt.index)}</Fragment>);
    if (mt[1] !== undefined) out.push(<MathSpan key={k++} src={mt[1]} />);
    else out.push(<strong key={k++}>{renderInner(mt[2])}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}

/** Bold text may itself contain {{math}}. */
function renderInner(s: string): ReactNode {
  return s.includes('{{') ? <MathText text={s} /> : s;
}

export function MathSpan({ src }: { src: string }) {
  const parts: ReactNode[] = [];
  const re = /(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/g;
  let last = 0;
  let k = 0;
  for (let mt = re.exec(src); mt; mt = re.exec(src)) {
    if (mt.index > last) parts.push(src.slice(last, mt.index));
    parts.push(
      <span className="frac" key={k++}>
        <span>{mt[1]}</span>
        <span>{mt[2]}</span>
      </span>,
    );
    last = re.lastIndex;
  }
  if (last < src.length) parts.push(src.slice(last));
  return <span className="math">{parts}</span>;
}
