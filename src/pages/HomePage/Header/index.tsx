import { useTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import PageTitle from '../../../components/PageTitle';
import s from './style.module.css';

export function HomePageHeader() {
    const { t } = useTranslation();

    return (
        <>
            <PageTitle title={t('name')} />
            <Header subLine={<div className={s.claim}>{t('home.claim')}</div>}>
                <span className={s.headingMacht}>macht.</span>
                <span className={s.headingSprache}>sprache.</span>
            </Header>
        </>
    );
}
