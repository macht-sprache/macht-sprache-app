import s from './style.module.css';
import { useOverlay, usePreventScroll, useModal, OverlayContainer } from '@react-aria/overlays';

import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useRef } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

type ModalDialogProps = {
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    isDismissable?: boolean;
    width?: 'medium' | 'wide' | 'wider';
};

export function ModalDialog({ title, children, onClose, isDismissable = true, width = 'medium' }: ModalDialogProps) {
    usePreventScroll();
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const { overlayProps } = useOverlay({ onClose, isOpen: true, isDismissable }, ref);
    const { modalProps } = useModal();
    const { dialogProps, titleProps } = useDialog({}, ref);

    return (
        <OverlayContainer>
            <div className={s.background}>
                <FocusScope contain restoreFocus autoFocus>
                    <div
                        {...overlayProps}
                        {...dialogProps}
                        {...modalProps}
                        ref={ref}
                        className={clsx(s[width], s.overlay)}
                    >
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
        </OverlayContainer>
    );
}
