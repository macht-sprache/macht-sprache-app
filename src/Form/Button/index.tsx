import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    children: React.ReactNode;
    primary?: boolean;
}

export default function Button({ children, primary = false, ...props }: Props) {
    return (
        <button className={primary ? s.buttonPrimary : s.button} {...props}>
            {children}
        </button>
    );
}
