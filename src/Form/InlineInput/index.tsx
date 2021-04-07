import s from './style.module.css';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: string;
    onCancel?: () => void;
}

export function InlineInput({ label, onCancel, ...props }: InputProps) {
    return (
        <label className={s.container}>
            <span className={s.label}>{label}</span>
            <input className={s.input} {...props} />
            {onCancel && props.value && <button className={s.cancel} aria-hidden="true" onClick={onCancel} />}
        </label>
    );
}
