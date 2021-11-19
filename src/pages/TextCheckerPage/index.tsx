import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { FullWidthColumn } from '../../components/Layout/Columns';
import TextChecker from '../../components/TextChecker';

export default function TextCheckerPage() {
    const { t } = useTranslation();
    return (
        <>
            <Header subLine={t('textChecker.subLine')}>{t('textChecker.title')}</Header>
            <FullWidthColumn>
                <TextChecker />
            </FullWidthColumn>
        </>
    );
}
