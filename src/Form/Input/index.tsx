import s from './style.module.css';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    error?: string;
    span?: number;
}

export function Input({ label, value, span = 4, error, ...props }: InputProps) {
    const empty = !value;
    const inputProps = { value, ...props };

    return (
        <label className={error ? s.containerError : s.container} style={{ gridColumn: `span ${span}` }}>
            <div className={empty ? s.labelEmpty : s.label}>{label}</div>
            <input className={s.input} aria-invalid={!!error} {...inputProps} />
            {error && (
                <div aria-live="assertive" className={s.error}>
                    {error}
                </div>
            )}
        </label>
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
    const empty = !value;
    const selectProps = { value, ...props };

    return (
        <label
            className={error ? s.selectContainerWithError : s.selectContainer}
            style={{ gridColumn: `span ${span}` }}
        >
            <div className={empty ? s.selectLabelEmpty : s.selectLabel}>{label}</div>
            <select className={s.select} aria-invalid={!!error} {...selectProps}>
                {children}
            </select>
            {error && (
                <div aria-live="assertive" className={s.error}>
                    {error}
                </div>
            )}
        </label>
    );
}

interface TextareaProps
    extends React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
    label: React.ReactNode;
    span?: number;
    error?: string;
}

export function Textarea({ label, span = 4, value, error, ...props }: TextareaProps) {
    const empty = !value;
    const testareaProps = { value, ...props };

    return (
        <label
            className={error ? s.textareaContainerWithError : s.textareaContainer}
            style={{ gridColumn: `span ${span}` }}
        >
            <div className={empty ? s.textareaLabelEmpty : s.textareaLabel}>{label}</div>
            <textarea className={s.textarea} aria-invalid={!!error} {...testareaProps} />

            {error && (
                <div aria-live="assertive" className={s.error}>
                    {error}
                </div>
            )}
        </label>
    );
}
