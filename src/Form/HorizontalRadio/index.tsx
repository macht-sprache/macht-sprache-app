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
}

export function HorizontalRadio({ label, ...props }: RadioProps) {
    const domId = 'id_' + props.value;

    return (
        <div className={s.radioWrapper}>
            <input type="radio" {...props} id={domId} className={s.radio} />
            <label htmlFor={domId} className={s.label}>
                {label}
            </label>
        </div>
    );
}
