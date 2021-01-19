import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    span?: number;
}

export default function Input({ label, span = 4, ...props }: Props) {
    return (
        <label className={s.container} style={{ gridColumn: `span ${span}` }}>
            <input className={s.input} placeholder=" " {...props} />
            <div className={s.label}>{label}</div>
        </label>
    );
}
