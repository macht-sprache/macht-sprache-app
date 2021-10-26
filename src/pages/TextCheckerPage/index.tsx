import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { SingleColumn } from '../../components/Layout/Columns';
import TextChecker from '../../components/TextChecker';

export default function TextCheckerPage() {
    const { t } = useTranslation();
    return (
        <>
            <Header subLine={t('textChecker.subLine')}>{t('textChecker.title')}</Header>
            <SingleColumn>
                <TextChecker />
            </SingleColumn>
        </>
    );
}
