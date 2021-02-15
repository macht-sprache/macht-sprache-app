import clsx from 'clsx';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    primary?: boolean;
    size?: 'small' | 'medium';
}

export type Ref = HTMLButtonElement;

const Button = forwardRef<Ref | null, Props>(({ primary = false, size = 'medium', ...props }: Props, ref) => {
    return (
        <button
            ref={ref}
            className={clsx(s.button, { [s.buttonPrimary]: primary, [s.small]: size === 'small' })}
            {...props}
        />
    );
});

export default Button;

interface ButtonLinkProps extends LinkProps {
    primary?: boolean;
    size?: 'small' | 'medium';
}

export function ButtonLink({ primary = false, size, ...props }: ButtonLinkProps) {
    return <Link className={clsx(s.button, { [s.buttonPrimary]: primary, [s.small]: size === 'small' })} {...props} />;
}

type ButtonContainerProps = {
    children: React.ReactNode;
    align?: 'left' | 'right';
};

export function ButtonContainer({ children, align = 'right' }: ButtonContainerProps) {
    return <div className={align === 'right' ? s.buttonContainer : s.buttonContainerLeftAligned}>{children}</div>;
}
