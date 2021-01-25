import { langA, langB } from '../../languages';
import { Lang } from '../../types';
import s from './style.module.css';

type ContainerProps = {
    children: React.ReactNode;
};

const backgroundClassNames = {
    default: s.label,
    striped: s.labelStriped,
    [langA]: s.labelLangA,
    [langB]: s.labelLangB,
};

export function HorizontalRadioContainer({ children }: ContainerProps) {
    return <div className={s.container}>{children}</div>;
}

interface RadioProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    value: string;
    background?: 'striped' | Lang | 'default';
}

export function HorizontalRadio({ label, background = 'default', ...props }: RadioProps) {
    const domId = 'id_' + props.value;

    return (
        <div className={s.radioWrapper}>
            <input type="radio" {...props} id={domId} className={s.radio} />
            <label htmlFor={domId} className={backgroundClassNames[background]}>
                {label}
            </label>
        </div>
    );
}
