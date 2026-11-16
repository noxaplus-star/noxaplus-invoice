import { useId, type ReactNode } from 'react';
import { Icon, type IconName } from './Icons';

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'date';
  hint?: string;
  ltr?: boolean;
  autoComplete?: string;
  className?: string;
}

export function Field({ label, value, onChange, placeholder, type = 'text', hint, ltr, autoComplete, className }: FieldProps) {
  const id = useId();
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {hint ? <span className="field__hint">{hint}</span> : null}
      </label>
      <input
        id={id}
        className={`field__input${ltr ? ' field__input--ltr' : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        dir={ltr ? 'ltr' : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  counter?: string;
  hint?: string;
}

export function TextArea({ label, value, onChange, placeholder, rows = 4, counter, hint }: TextAreaProps) {
  const id = useId();
  return (
    <div className="field">
      {label ? (
        <label className="field__label" htmlFor={id}>
          {label}
          {counter ? <span className="field__hint">{counter}</span> : null}
        </label>
      ) : null}
      <textarea
        id={id}
        className="field__input field__textarea"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="field__note">{hint}</p> : null}
    </div>
  );
}

interface IconButtonProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tone?: 'default' | 'danger' | 'accent';
  size?: number;
  badge?: boolean;
}

export function IconButton({ icon, label, onClick, active, disabled, tone = 'default', size = 17, badge }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn--${tone}${active ? ' is-active' : ''}${badge ? ' has-badge' : ''}`}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      className={`switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__track"><span className="switch__thumb" /></span>
    </button>
  );
}

interface SectionCardProps {
  title: string;
  count: number;
  visible: boolean;
  hiddenLabel: string;
  eyeLabel: string;
  upLabel: string;
  downLabel: string;
  disabledUp: boolean;
  disabledDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  children: ReactNode;
}

export function SectionCard({
  title,
  count,
  visible,
  hiddenLabel,
  eyeLabel,
  upLabel,
  downLabel,
  disabledUp,
  disabledDown,
  onMoveUp,
  onMoveDown,
  onToggle,
  children,
}: SectionCardProps) {
  return (
    <section className={`card editor-card${visible ? '' : ' is-hidden'}`}>
      <header className="editor-card__head">
        <div className="editor-card__heading">
          <h3>{title}</h3>
          {count > 0 ? <span className="count-badge">{count}</span> : null}
          {!visible ? <span className="hidden-badge">{hiddenLabel}</span> : null}
        </div>
        <div className="editor-card__tools">
          <IconButton icon="up" label={upLabel} onClick={onMoveUp} disabled={disabledUp} size={15} />
          <IconButton icon="down" label={downLabel} onClick={onMoveDown} disabled={disabledDown} size={15} />
          <IconButton icon={visible ? 'eye' : 'eyeOff'} label={eyeLabel} onClick={onToggle} active={!visible} size={16} />
        </div>
      </header>
      <div className="editor-card__body">{children}</div>
    </section>
  );
}

export function EmptyRow({ text, cta, onAdd }: { text: string; cta: string; onAdd: () => void }) {
  return (
    <div className="empty-row">
      <p>{text}</p>
      <button type="button" className="btn btn--ghost btn--sm" onClick={onAdd}>
        <Icon name="plus" size={15} />
        {cta}
      </button>
    </div>
  );
}
