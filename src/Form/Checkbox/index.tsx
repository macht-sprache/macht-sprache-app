import { useDomId } from '../../useDomId';
import s from './style.module.css';

interface CheckboxProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: React.ReactNode;
}

export function Checkbox({ label, ...props }: CheckboxProps) {
    const id = useDomId();

    return (
        <div className={s.container}>
            <input id={id('checkbox')} type="checkbox" {...props} className={s.checkbox} />
            <div className={s.checkboxDisplay} />
            <label className={s.label} htmlFor={id('checkbox')}>
                {label}
            </label>
        </div>
    );
}
