import { useTranslation } from 'react-i18next';
import Header from '../Header';

export default function PageLoadingState() {
    const { t } = useTranslation();
    return <Header>{t('common.loading')}</Header>;
}
