import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { SingleColumn } from '../Layout/Columns';
import { Terms } from '../Terms';

export function TermsPage() {
    const { t } = useTranslation();
    return (
        <>
            <Header>{t('common.entities.term.value_plural')}</Header>
            <SingleColumn>
                <Terms />
            </SingleColumn>
        </>
    );
}
