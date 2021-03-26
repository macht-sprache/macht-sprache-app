import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonContainer } from '../Form/Button';
import { useUser } from '../hooks/appContext';
import { Columns } from '../Layout/Columns';
import { ModalDialog } from '../ModalDialog';
import s from './style.module.css';
import Illustration from './illustration.jpg';

const LOCAL_STORAGE_ID = 'overlayShown';

export function ContentWarning() {
    const user = useUser();
    const { t } = useTranslation();
    const [showOverlay, setShowOverlay] = useState(!(localStorage.getItem(LOCAL_STORAGE_ID) === 'true') && !user);
    console.log(user, showOverlay);

    function dismissOverlay() {
        setShowOverlay(false);
        localStorage.setItem(LOCAL_STORAGE_ID, 'true');
    }

    if (!showOverlay) return null;

    return (
        <ModalDialog
            isDismissable={false}
            onClose={() => {
                dismissOverlay();
            }}
            title={t('contentWarning.title')}
            width="wide"
        >
            <div className={s.body}>
                <div>
                    <img className={s.illustration} src={Illustration} alt="" />
                    <span className={s.imageCredit}>Illustration: Jane Schueler</span>
                </div>
                <div>
                    <p className={s.warning}>{t('contentWarning.warning')}</p>

                    <ButtonContainer>
                        <Button onClick={dismissOverlay}>{t('contentWarning.button')}</Button>
                    </ButtonContainer>
                </div>
            </div>
        </ModalDialog>
    );
}
