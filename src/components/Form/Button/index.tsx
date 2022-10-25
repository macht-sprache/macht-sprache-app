import clsx from 'clsx';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import s from './style.module.css';

type ExtraButtonProps = {
    primary?: boolean;
    size?: 'small' | 'medium' | 'large';
    busy?: boolean;
};

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> &
    ExtraButtonProps;

export type Ref = HTMLButtonElement;

const Button = forwardRef<Ref | null, ButtonProps>(({ ...props }: ButtonProps, ref) => {
    return <button ref={ref} {...omitExtraButtonProps(props)} className={getButtonClasses(props)} />;
});

export default Button;

type ButtonLinkProps = LinkProps & ExtraButtonProps;

export function ButtonLink({ ...props }: ButtonLinkProps) {
    return <Link {...omitExtraButtonProps(props)} className={getButtonClasses(props)} />;
}

type ButtonAnchorProps = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> &
    ExtraButtonProps;

export function ButtonAnchor({ children, ...props }: ButtonAnchorProps) {
    return (
        <a {...omitExtraButtonProps(props)} className={getButtonClasses(props)}>
            {children}
        </a>
    );
}

function getButtonClasses({ primary, size = 'medium', busy, className }: ExtraButtonProps & { className?: string }) {
    return clsx(s.button, s[size], { [s.buttonPrimary]: primary, [s.busy]: busy }, className);
}

function omitExtraButtonProps<A extends ButtonProps | ButtonLinkProps | ButtonAnchorProps>({
    primary,
    size,
    busy,
    ...props
}: A): Omit<A, 'primary' | 'size' | 'busy'> {
    return props;
}

type ButtonContainerProps = {
    children: React.ReactNode;
    align?: 'left' | 'right' | 'center';
};

export function ButtonContainer({ children, align = 'right' }: ButtonContainerProps) {
    return <div className={clsx(s.buttonContainer, s[align])}>{children}</div>;
}
