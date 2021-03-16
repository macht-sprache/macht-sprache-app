import clsx from 'clsx';
import { Link, LinkProps } from 'react-router-dom';
import { LoginHint } from '../LoginHint';
import s from './style.module.css';

interface AddEntityButtonProps extends LinkProps {}

export function AddEntityButton({ className, ...props }: AddEntityButtonProps) {
    return (
        <LoginHint i18nKey="translation.registerToAdd">
            <Link className={clsx(s.button, className)} {...props} />
        </LoginHint>
    );
}
