import s from './style.module.css';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    error?: string;
    span?: number;
}

export function Input({ label, value, span = 4, error, ...props }: InputProps) {
    const inputProps = { value, ...props };

    return (
        <Container error={error} span={span} label={label} empty={!value}>
            <input className={s.input} aria-invalid={!!error} {...inputProps} />
        </Container>
    );
}

interface SelectProps
    extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
    label: React.ReactNode;
    children: React.ReactNode;
    span?: number;
    error?: string;
}

export function Select({ label, span = 4, children, value, error, ...props }: SelectProps) {
    const selectProps = { value, ...props };

    return (
        <Container error={error} span={span} label={label} empty={!value}>
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
    error?: string;
}

export function Textarea({ label, span = 4, value, error, ...props }: TextareaProps) {
    const testareaProps = { value, ...props };

    return (
        <Container error={error} span={span} label={label} empty={!value}>
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
}: {
    children: React.ReactNode;
    error?: string;
    span?: number;
    label: React.ReactNode;
    empty: boolean;
}) => {
    return (
        <label className={error ? s.containerError : s.container} style={{ gridColumn: `span ${span}` }}>
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
