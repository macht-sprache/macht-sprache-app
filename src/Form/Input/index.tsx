import { useState } from 'react';
import s from './style.module.css';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    span?: number;
}

export function Input({ label, span, ...props }: InputProps) {
    const [domId] = useState('input_' + Math.random());

interface SelectProps
    extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
    label: React.ReactNode;
    children: React.ReactNode;
    span?: number;
}

export function Select({ label, span, children, value, ...props }: SelectProps) {
    const empty = !value;
    const selectProps = { value, ...props };

    return (
        <label className={s.selectContainer} style={{ gridColumn: `span ${span}` }}>
            <div className={empty ? s.selectLabelEmpty : s.selectLabel}>{label}</div>
            <select className={s.select} {...selectProps}>
                {children}
            </select>
        </label>
    );
}

    return (
        <label className={s.container} style={{ gridColumn: `span ${span}` }}>
            <div className={s.ariaLabel} id={domId}>
                {label}
            </div>
            <input className={s.input} placeholder=" " {...props} aria-labelledby={domId} />
            <div className={s.label} aria-hidden="true">
                {label}
            </div>
        </label>
    );
}
