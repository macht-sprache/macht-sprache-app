import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import s from './style.module.css';

type CommonProps = {
    label: React.ReactNode;
    error?: React.ReactNode;
    inlineButton?: React.ReactNode;
    span?: number;
    busy?: boolean;
    optional?: boolean;
    dontAnimateLabel?: boolean;
    inputClassName?: string;
};

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & CommonProps;

export function Input({
    label,
    value,
    disabled,
    span = 4,
    busy = false,
    error,
    inlineButton,
    optional,
    dontAnimateLabel,
    inputClassName,
    ...props
}: InputProps) {
    const inputProps = { value, disabled, ...props };

    return (
        <Container
            busy={busy}
            error={error}
            inlineButton={inlineButton}
            disabled={disabled}
            span={span}
            label={label}
            empty={!value}
            optional={optional}
            placeholder={props.placeholder}
            dontAnimateLabel={dontAnimateLabel}
        >
            <input className={clsx(s.input, inputClassName)} aria-invalid={!!error} {...inputProps} />
        </Container>
    );
}

type SelectProps = React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> &
    CommonProps;

export function Select({
    label,
    span = 4,
    children,
    value,
    disabled,
    error,
    inlineButton,
    busy,
    optional,
    dontAnimateLabel,
    inputClassName,
    ...props
}: SelectProps) {
    const selectProps = { value, disabled, ...props };

    return (
        <Container
            busy={busy}
            error={error}
            inlineButton={inlineButton}
            disabled={disabled}
            span={span}
            label={label}
            empty={!value}
            optional={optional}
            dontAnimateLabel={dontAnimateLabel}
        >
            <select className={clsx(s.select, inputClassName)} aria-invalid={!!error} {...selectProps}>
                {children}
            </select>
        </Container>
    );
}

type TextareaProps = React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> &
    CommonProps & { minHeight?: string };

export function Textarea({
    label,
    span = 4,
    value,
    disabled,
    error,
    inlineButton,
    busy,
    maxLength,
    minHeight,
    optional,
    dontAnimateLabel,
    inputClassName,
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
            inlineButton={inlineButton}
            disabled={disabled}
            span={span}
            label={label}
            empty={!value}
            optional={optional}
            warning={displayCharLimitWarning ? t('common.textAeraCharWarning', { count: charLeft }) : undefined}
            placeholder={props.placeholder}
            dontAnimateLabel={dontAnimateLabel}
        >
            <div className={s.textAreaWrapper}>
                <textarea className={clsx(s.textarea, inputClassName)} aria-invalid={!!error} {...textareaProps} />
                <div className={clsx(s.textareaDummy, inputClassName)} aria-hidden="true" style={{ minHeight }}>
                    {textareaProps.value ? textareaProps.value + ' ' : ' '}
                </div>
            </div>
        </Container>
    );
}

const Container = ({
    children,
    error,
    span,
    label,
    inlineButton,
    empty,
    disabled,
    busy,
    warning,
    optional,
    placeholder,
    dontAnimateLabel,
}: {
    children: React.ReactNode;
    error?: React.ReactNode;
    span?: number;
    inlineButton?: React.ReactNode;
    label: React.ReactNode;
    empty: boolean;
    disabled?: boolean;
    busy?: boolean;
    warning?: string;
    optional?: boolean;
    placeholder?: string;
    dontAnimateLabel?: boolean;
}) => {
    const { t } = useTranslation();

    return (
        <label
            className={clsx(s.container, {
                [s.containerError]: error,
                [s.containerDisabled]: disabled,
                [s.containerBusy]: busy,
                [s.hasPlaceholder]: !!placeholder,
                [s.dontAnimateLabel]: dontAnimateLabel,
            })}
            style={{ gridColumn: `span ${span}` }}
        >
            <div className={s.inputContainer}>
                <div className={empty ? s.labelEmpty : s.label}>
                    {label}
                    {optional && <> ({t('common.optional')})</>}
                </div>
                {children}
                {inlineButton && <div className={s.inlineButton}>{inlineButton}</div>}
            </div>
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
