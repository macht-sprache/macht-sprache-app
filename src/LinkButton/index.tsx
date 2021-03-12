import clsx from 'clsx';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    children: React.ReactNode;
}

export default function LinkButton({ children, className, ...props }: Props) {
    return (
        <button className={clsx(s.button, className)} {...props}>
            {children}
        </button>
    );
}
