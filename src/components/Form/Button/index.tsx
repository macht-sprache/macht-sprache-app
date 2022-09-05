import clsx from 'clsx';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import s from './style.module.css';

type extraButtonProps = {
    primary?: boolean;
    size?: 'small' | 'medium';
    busy?: boolean;
};

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> &
    extraButtonProps;

export type Ref = HTMLButtonElement;

const Button = forwardRef<Ref | null, ButtonProps>((props: ButtonProps, ref) => {
    return <button ref={ref} className={getButtonClasses(props)} {...props} />;
});

export default Button;

type ButtonLinkProps = LinkProps & extraButtonProps;

export function ButtonLink(props: ButtonLinkProps) {
    return <Link className={getButtonClasses(props)} {...props} />;
}

type ButtonAnchorProps = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> &
    extraButtonProps;

export function ButtonAnchor({ children, ...props }: ButtonAnchorProps) {
    return (
        <a className={getButtonClasses(props)} {...props}>
            {children}
        </a>
    );
}

function getButtonClasses({ primary, size = 'medium', busy, className }: extraButtonProps & { className?: string }) {
    return clsx(s.button, { [s.buttonPrimary]: primary, [s.small]: size === 'small', [s.busy]: busy }, className);
}

type ButtonContainerProps = {
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center';
};

export function ButtonContainer({ children, align = 'right' }: ButtonContainerProps) {
    return <div className={clsx(s.buttonContainer, s[align])}>{children}</div>;
}
