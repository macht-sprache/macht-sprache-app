import { stringify } from 'querystring';
import s from './style.module.css';

type ContainerProps = {
    children: React.ReactNode;
};

export function HorizontalRadioContainer({ children }: ContainerProps) {
    return <div className={s.container}>{children}</div>;
}

interface RadioProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
    value: string;
    background?: string;
}

export function HorizontalRadio({ label, background, ...props }: RadioProps) {
    const domId = 'id_' + props.value;

    const backgroundClassNames: { [key: string]: string } = {
        striped: s.labelStriped,
        de: s.labelDe,
        en: s.labelEn,
    };

    console.log(background);

    return (
        <div className={s.radioWrapper}>
            <input type="radio" {...props} id={domId} className={s.radio} />
            <label htmlFor={domId} className={background ? backgroundClassNames[background] : s.label}>
                {label}
            </label>
        </div>
    );
}
