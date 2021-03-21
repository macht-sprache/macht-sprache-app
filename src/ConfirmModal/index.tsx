import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonContainer } from '../Form/Button';
import { SingleColumn } from '../Layout/Columns';
import { ModalDialog } from '../ModalDialog';

type Props = {
    title: React.ReactNode;
    body: React.ReactNode;
    confirmLabel: React.ReactNode;
    onConfirm: () => void;
    children: (onClick: () => void) => React.ReactNode;
};

export default function ConfirmModal({ title, body, confirmLabel, children, onConfirm }: Props) {
    const { t } = useTranslation();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const openConfirmModal = useCallback(() => setShowConfirmModal(true), []);
    const closeConfirmModal = useCallback(() => setShowConfirmModal(false), []);

    return (
        <>
            {showConfirmModal && (
                <ModalDialog title={title} onClose={closeConfirmModal}>
                    <SingleColumn>
                        {body}
                        <ButtonContainer>
                            <Button type="button" onClick={closeConfirmModal}>
                                {t('common.formNav.cancel')}
                            </Button>
                            <Button type="button" primary onClick={onConfirm}>
                                {confirmLabel}
                            </Button>
                        </ButtonContainer>
                    </SingleColumn>
                </ModalDialog>
            )}
            {children(openConfirmModal)}
        </>
    );
}
