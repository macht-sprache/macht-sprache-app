import clsx from 'clsx';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    children?: React.ReactNode;
    underlined?: boolean;
}

export default function LinkButton({ children, className, underlined = false, ...props }: Props) {
    return (
        <button className={clsx(s.button, className, { [s.underlined]: underlined })} {...props}>
            {children}
        </button>
    );
}
