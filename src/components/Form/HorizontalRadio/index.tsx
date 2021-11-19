import clsx from 'clsx';
import { langA, langB } from '../../../languages';
import { Lang } from '../../../types';
import s from './style.module.css';

type ContainerProps = {
    children: React.ReactNode;
    label?: React.ReactNode;
    disabled?: boolean;
};

const backgroundClassNames = {
    default: s.label,
    striped: s.labelStriped,
    [langA]: s.labelLangA,
    [langB]: s.labelLangB,
};

export function HorizontalRadioContainer({ children, label, disabled = false }: ContainerProps) {
    const containerClasses = clsx(s.container, { [s.disabled]: disabled });
    if (label) {
        return (
            <div>
                <div className={clsx(s.containerLabel, { [s.disabled]: disabled })}>{label}</div>
                <div className={containerClasses}>{children}</div>
            </div>
        );
    }
    return <div className={containerClasses}>{children}</div>;
}

interface RadioProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    value: string;
    background?: 'striped' | Lang | 'default';
}

export function HorizontalRadio({ label, background = 'default', disabled, ...props }: RadioProps) {
    const domId = 'id_' + props.value;

    return (
        <div className={clsx(s.radioWrapper, { [s.disabled]: disabled })}>
            <input type="radio" id={domId} className={s.radio} disabled={disabled} {...props} />
            <label htmlFor={domId} className={backgroundClassNames[background]}>
                {label}
            </label>
        </div>
    );
}
