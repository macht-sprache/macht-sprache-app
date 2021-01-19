import { useState } from 'react';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    span?: number;
}

export default function Input({ label, span = 4, ...props }: Props) {
    const [domId] = useState('input_' + Math.random());

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
