import { MathSpan } from './MathText';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  allowColon: boolean;
  unit?: string;
  disabled?: boolean;
}

/** On-screen keypad, so the iPhone keyboard never covers the question. */
export function Keypad({ value, onChange, onSubmit, allowColon, unit, disabled }: Props) {
  const press = (k: string) => {
    if (disabled) return;
    if (k === 'back') return onChange(value.slice(0, -1));
    if (k === 'clear') return onChange('');
    if (value.length >= 16) return;
    onChange(value + k);
  };

  const keys: { k: string; label: string; cls?: string }[] = [
    { k: '7', label: '7' }, { k: '8', label: '8' }, { k: '9', label: '9' }, { k: 'back', label: '⌫', cls: 'fn' },
    { k: '4', label: '4' }, { k: '5', label: '5' }, { k: '6', label: '6' }, { k: 'clear', label: 'נקה', cls: 'fn' },
    { k: '1', label: '1' }, { k: '2', label: '2' }, { k: '3', label: '3' }, { k: '/', label: 'שבר /', cls: 'fn' },
    { k: '0', label: '0' }, { k: '.', label: '.' }, allowColon ? { k: ':', label: ':' } : { k: '-', label: '−' },
    { k: 'go', label: 'בדיקה', cls: 'go' },
  ];

  return (
    <div>
      <div className={'answer-box focus'} aria-live="polite">
        {value ? <MathSpan src={value} /> : <span className="placeholder">{allowColon ? 'למשל 2:3' : 'התשובה שלך'}</span>}
        {!disabled && <span className="caret" />}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="keypad">
        {keys.map(({ k, label, cls }) => (
          <button
            key={k}
            className={cls}
            disabled={disabled}
            onClick={() => (k === 'go' ? onSubmit() : press(k))}
            aria-label={k === 'back' ? 'מחיקה' : label}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
