import clsx from 'clsx';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    primary?: boolean;
    size?: 'small' | 'medium';
    busy?: boolean;
}

export type Ref = HTMLButtonElement;

const Button = forwardRef<Ref | null, Props>(
    ({ primary = false, size = 'medium', className, busy = false, ...props }: Props, ref) => {
        return (
            <button
                ref={ref}
                className={clsx(
                    s.button,
                    { [s.buttonPrimary]: primary, [s.small]: size === 'small', [s.busy]: busy },
                    className
                )}
                {...props}
            />
        );
    }
);

export default Button;

interface ButtonLinkProps extends LinkProps {
    primary?: boolean;
    size?: 'small' | 'medium';
}

export function ButtonLink({ primary = false, size, ...props }: ButtonLinkProps) {
    return <Link className={clsx(s.button, { [s.buttonPrimary]: primary, [s.small]: size === 'small' })} {...props} />;
}

interface ButtonAnchorProps
    extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
    primary?: boolean;
    size?: 'small' | 'medium';
}

export function ButtonAnchor({ primary = false, size, children, className, ...props }: ButtonAnchorProps) {
    return (
        <a
            className={clsx(s.button, className, { [s.buttonPrimary]: primary, [s.small]: size === 'small' })}
            {...props}
        >
            {children}
        </a>
    );
}

type ButtonContainerProps = {
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center';
};

export function ButtonContainer({ children, align = 'right' }: ButtonContainerProps) {
    return <div className={clsx(s.buttonContainer, s[align])}>{children}</div>;
}
