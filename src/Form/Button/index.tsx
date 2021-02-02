import { Link, LinkProps } from 'react-router-dom';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    primary?: boolean;
}

export default function Button({ primary = false, ...props }: Props) {
    return <button className={primary ? s.buttonPrimary : s.button} {...props} />;
}

interface ButtonLinkProps extends LinkProps {
    primary?: boolean;
}

export function ButtonLink({ primary = false, ...props }: ButtonLinkProps) {
    return <Link className={primary ? s.buttonPrimary : s.button} {...props} />;
}

type ButtonContainerProps = {
    children: React.ReactNode;
};

export function ButtonContainer({ children }: ButtonContainerProps) {
    return <div className={s.buttonContainer}>{children}</div>;
}
