import { Link, LinkProps } from 'react-router-dom';
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

interface ButtonLinkProps extends LinkProps {
    children: React.ReactNode;
    primary?: boolean;
}

export function ButtonLink({ children, primary = false, ...props }: ButtonLinkProps) {
    return (
        <Link className={primary ? s.buttonPrimary : s.button} {...props}>
            {children}
        </Link>
    );
}

type ButtonContainerProps = {
    children: React.ReactNode;
};

export function ButtonContainer({ children }: ButtonContainerProps) {
    return <div className={s.buttonContainer}>{children}</div>;
}
