import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { FullWidthColumn } from '../../components/Layout/Columns';
import PageTitle from '../../components/PageTitle';
import TextChecker from '../../components/TextChecker';

export default function TextCheckerPage() {
    const { t } = useTranslation();
    return (
        <>
            <Header subLine={t('textChecker.subLine')}>{t('textChecker.title')}</Header>
            <PageTitle title={t('textChecker.title')} />

            <FullWidthColumn>
                <TextChecker />
            </FullWidthColumn>
        </>
    );
}
