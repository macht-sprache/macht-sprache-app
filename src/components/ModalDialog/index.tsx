import clsx from 'clsx';
import { ReactEventHandler, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../Layout/logo.svg';
import { ModalDialogContainer } from './Provider';
import s from './style.module.css';

type ModalDialogProps = {
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    isDismissable?: boolean;
    width?: 'medium' | 'wide' | 'wider';
    showLogo?: boolean;
};

export function ModalDialog({
    title,
    children,
    onClose,
    isDismissable = true,
    width = 'medium',
    showLogo,
}: ModalDialogProps) {
    usePreventScroll();
    const { t } = useTranslation();

    return (
        <Dialog onClose={onClose} isDismissable={isDismissable} className={s.overlay}>
            <div className={clsx(s[width], s.overlayInner)}>
                {showLogo && <img className={s.logo} src={Logo} alt="" />}
                <header className={s.header}>
                    <h3 className={s.title}>{title}</h3>
                    {isDismissable && (
                        <button className={s.closeButton} aria-label={t('common.formNav.close')} onClick={onClose} />
                    )}
                </header>
                {children}
            </div>
        </Dialog>
    );
}

function Dialog({
    children,
    onClose,
    isDismissable,
    className,
}: {
    children: React.ReactNode;
    onClose: () => void;
    isDismissable: boolean;
    className?: string;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const el = ref.current;
        el?.showModal();
        return () => el?.close();
    }, []);

    const onClick = useCallback<React.MouseEventHandler>(
        event => {
            if (isDismissable && event.target === ref.current) {
                onClose();
            }
        },
        [isDismissable, onClose]
    );

    const onCancel = useCallback<ReactEventHandler<HTMLDialogElement>>(
        event => {
            event.preventDefault();
            if (isDismissable) {
                onClose();
            }
        },
        [isDismissable, onClose]
    );

    return (
        <ModalDialogContainer>
            <dialog ref={ref} onCancel={onCancel} onClick={onClick} className={className}>
                {children}
            </dialog>
        </ModalDialogContainer>
    );
}

function usePreventScroll() {
    useEffect(() => {
        document.documentElement.classList.add(s.noScroll);
        return () => document.documentElement.classList.remove(s.noScroll);
    }, []);
}
