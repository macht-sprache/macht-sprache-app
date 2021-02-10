import { useTranslation } from 'react-i18next';

export default function SavingState() {
    const { t } = useTranslation();
    return <>{t('common.saving')}</>;
}
