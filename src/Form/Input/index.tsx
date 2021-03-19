import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import s from './style.module.css';

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    error?: React.ReactNode;
    span?: number;
    busy?: boolean;
    optional?: boolean;
}

export function Input({ label, value, disabled, span = 4, busy = false, error, optional, ...props }: InputProps) {
    const inputProps = { value, disabled, ...props };

    return (
        <Container
            busy={busy}
            error={error}
            disabled={disabled}
            span={span}
            label={label}
            empty={!value}
            optional={optional}
        >
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
    optional?: boolean;
}

export function Select({ label, span = 4, children, value, disabled, error, busy, optional, ...props }: SelectProps) {
    const selectProps = { value, disabled, ...props };

    return (
        <Container
            busy={busy}
            error={error}
            disabled={disabled}
            span={span}
            label={label}
            empty={!value}
            optional={optional}
        >
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
    minHeight?: string;
    optional?: boolean;
}

export function Textarea({
    label,
    span = 4,
    value,
    disabled,
    error,
    busy,
    maxLength,
    minHeight,
    optional,
    ...props
}: TextareaProps) {
    const { t } = useTranslation();
    const textareaProps = { value, disabled, maxLength, ...props };
    const charLeft = typeof value === 'string' && maxLength ? maxLength - value.length : 0;
    const displayCharLimitWarning = typeof value === 'string' && maxLength && charLeft < 20;

    return (
        <Container
            busy={busy}
            error={error}
            disabled={disabled}
            span={span}
            label={label}
            empty={!value}
            optional={optional}
            warning={displayCharLimitWarning ? t('common.textAeraCharWarning', { count: charLeft }) : undefined}
            placeholder={props.placeholder}
        >
            <textarea className={s.textarea} aria-invalid={!!error} {...textareaProps} style={{ minHeight }} />
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
    warning,
    optional,
    placeholder,
}: {
    children: React.ReactNode;
    error?: React.ReactNode;
    span?: number;
    label: React.ReactNode;
    empty: boolean;
    disabled?: boolean;
    busy?: boolean;
    warning?: string;
    optional?: boolean;
    placeholder?: string;
}) => {
    const { t } = useTranslation();

    return (
        <label
            className={clsx(s.container, {
                [s.containerError]: error,
                [s.containerDisabled]: disabled,
                [s.containerBusy]: busy,
                [s.hasPlaceholder]: !!placeholder,
            })}
            style={{ gridColumn: `span ${span}` }}
        >
            <div className={empty ? s.labelEmpty : s.label}>
                {label}
                {optional && <> ({t('common.optional')})</>}
            </div>
            {children}
            {error && (
                <div aria-live="assertive" className={s.error}>
                    {error}
                </div>
            )}
            {warning && (
                <div aria-live="assertive" className={s.warning}>
                    {warning}
                </div>
            )}
        </label>
    );
};
