import s from './style.module.css';
import { useOverlay, usePreventScroll, useModal, OverlayContainer } from '@react-aria/overlays';

import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useRef } from 'react';

type ModalDialogProps = {
    onClose: () => void;
    title: React.ReactNode;
    isOpen: boolean;
    isDismissable: boolean;
    children: React.ReactNode;
};

export function ModalDialog(props: ModalDialogProps) {
    let { title, children } = props;

    // Handle interacting outside the dialog and pressing
    // the Escape key to close the modal.
    let ref = useRef<HTMLElement>(null);
    let { overlayProps } = useOverlay(props, ref);

    // Prevent scrolling while the modal is open, and hide content
    // outside the modal from screen readers.
    usePreventScroll();
    let { modalProps } = useModal();

    // Get props for the dialog and its title
    let { dialogProps, titleProps } = useDialog(props as any, ref);

    return (
        <OverlayContainer>
            <div className={s.background}>
                <FocusScope contain restoreFocus autoFocus>
                    <div {...overlayProps} {...dialogProps} {...modalProps} ref={ref as any} className={s.overlay}>
                        <h3 {...titleProps} className={s.title}>
                            {title}
                        </h3>
                        {children}
                    </div>
                </FocusScope>
            </div>
        </OverlayContainer>
    );
}
