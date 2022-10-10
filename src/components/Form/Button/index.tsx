import clsx from 'clsx';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import s from './style.module.css';

type extraButtonProps = {
    primary?: boolean;
    size?: 'small' | 'medium' | 'large';
    busy?: boolean;
};

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> &
    extraButtonProps;

export type Ref = HTMLButtonElement;

const Button = forwardRef<Ref | null, ButtonProps>(({ ...props }: ButtonProps, ref) => {
    return <button ref={ref} {...omitExtraButtonProps(props)} className={getButtonClasses(props)} />;
});

export default Button;

type ButtonLinkProps = LinkProps & extraButtonProps;

export function ButtonLink({ ...props }: ButtonLinkProps) {
    return <Link {...omitExtraButtonProps(props)} className={getButtonClasses(props)} />;
}

type ButtonAnchorProps = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> &
    extraButtonProps;

export function ButtonAnchor({ children, ...props }: ButtonAnchorProps) {
    return (
        <a {...omitExtraButtonProps(props)} className={getButtonClasses(props)}>
            {children}
        </a>
    );
}

function getButtonClasses({ primary, size = 'medium', busy, className }: extraButtonProps & { className?: string }) {
    return clsx(s.button, s[size], { [s.buttonPrimary]: primary, [s.busy]: busy }, className);
}

function omitExtraButtonProps({ primary, size, busy, ...props }: ButtonProps): ButtonProps;
function omitExtraButtonProps({ primary, size, busy, ...props }: ButtonLinkProps): ButtonLinkProps;
function omitExtraButtonProps({ primary, size, busy, ...props }: ButtonAnchorProps): ButtonAnchorProps;
function omitExtraButtonProps({ primary, size, busy, ...props }: ButtonProps | ButtonLinkProps | ButtonAnchorProps) {
    return props;
}

type ButtonContainerProps = {
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center';
};

export function ButtonContainer({ children, align = 'right' }: ButtonContainerProps) {
    return <div className={clsx(s.buttonContainer, s[align])}>{children}</div>;
}
