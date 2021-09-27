import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SimpleHeader } from '../../components/Header';

export function NotFoundPage() {
    const { t } = useTranslation();
    return (
        <>
            <SimpleHeader>{t('notFound.heading')}</SimpleHeader>
            <p>
                <Trans t={t} i18nKey="notFound.paragraph" components={{ Link: <Link to="/" /> }} />
            </p>
        </>
    );
}
