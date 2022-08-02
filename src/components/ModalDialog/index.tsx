import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useModal, useOverlay, usePreventScroll } from '@react-aria/overlays';
import clsx from 'clsx';
import { useRef } from 'react';
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
    const ref = useRef<HTMLDivElement>(null);
    const { overlayProps } = useOverlay({ onClose, isOpen: true, isDismissable }, ref);
    const { modalProps } = useModal();
    const { dialogProps, titleProps } = useDialog({}, ref);

    return (
        <ModalDialogContainer>
            <div className={s.background}>
                <FocusScope contain restoreFocus autoFocus>
                    <div
                        {...overlayProps}
                        {...dialogProps}
                        {...modalProps}
                        ref={ref}
                        className={clsx(s[width], s.overlay, { [s.showLogo]: showLogo })}
                    >
                        {showLogo && <img className={s.logo} src={Logo} alt="" />}
                        <header className={s.header}>
                            <h3 {...titleProps} className={s.title}>
                                {title}
                            </h3>
                            {isDismissable && (
                                <button
                                    className={s.closeButton}
                                    aria-label={t('common.formNav.close')}
                                    onClick={onClose}
                                />
                            )}
                        </header>
                        {children}
                    </div>
                </FocusScope>
            </div>
        </ModalDialogContainer>
    );
}
