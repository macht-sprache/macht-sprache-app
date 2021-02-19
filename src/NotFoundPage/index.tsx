import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '../Header';

export function NotFoundPage() {
    const { t } = useTranslation();
    return (
        <>
            <Header>{t('notFound.heading')}</Header>
            <p>
                <Trans t={t} i18nKey="notFound.paragraph" components={{ Link: <Link to="/" /> }} />
            </p>
        </>
    );
}
