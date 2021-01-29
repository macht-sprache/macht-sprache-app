import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    children: React.ReactNode;
}

export default function LinkButton({ children, ...props }: Props) {
    return (
        <button className={s.button} {...props}>
            {children}
        </button>
    );
}
