import s from './style.module.css';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    error?: React.ReactNode;
    span?: number;
    busy?: boolean;
}

export function Input({ label, value, disabled, span = 4, busy = false, error, ...props }: InputProps) {
    const inputProps = { value, disabled, ...props };

    return (
        <Container busy={busy} error={error} disabled={disabled} span={span} label={label} empty={!value}>
            <input className={s.input} aria-invalid={!!error} {...inputProps} />
        </Container>
    );
}

interface SelectProps
    extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
    label: React.ReactNode;
    children: React.ReactNode;
    span?: number;
    error?: React.ReactNode;
    busy?: boolean;
}

export function Select({ label, span = 4, children, value, disabled, error, busy, ...props }: SelectProps) {
    const selectProps = { value, disabled, ...props };
    console.log(busy);

    return (
        <Container busy={busy} error={error} disabled={disabled} span={span} label={label} empty={!value}>
            <select className={s.select} aria-invalid={!!error} {...selectProps}>
                {children}
            </select>
        </Container>
    );
}

interface TextareaProps
    extends React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
    label: React.ReactNode;
    span?: number;
    error?: React.ReactNode;
    busy?: boolean;
}

export function Textarea({ label, span = 4, value, disabled, error, busy, ...props }: TextareaProps) {
    const testareaProps = { value, disabled, ...props };

    return (
        <Container busy={busy} error={error} disabled={disabled} span={span} label={label} empty={!value}>
            <textarea className={s.textarea} aria-invalid={!!error} {...testareaProps} />
        </Container>
    );
}

const Container = ({
    children,
    error,
    span,
    label,
    empty,
    disabled,
    busy,
}: {
    children: React.ReactNode;
    error?: React.ReactNode;
    span?: number;
    label: React.ReactNode;
    empty: boolean;
    disabled?: boolean;
    busy?: boolean;
}) => {
    return (
        <label
            className={error ? s.containerError : disabled ? s.containerDisabled : busy ? s.containerBusy : s.container}
            style={{ gridColumn: `span ${span}` }}
        >
            <div className={empty ? s.labelEmpty : s.label}>{label}</div>
            {children}
            {error && (
                <div aria-live="assertive" className={s.error}>
                    {error}
                </div>
            )}
        </label>
    );
};
