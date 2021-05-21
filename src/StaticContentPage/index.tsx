import { useTranslation } from 'react-i18next';
import Header, { SimpleHeader } from '../Header';
import { SingleColumn } from '../Layout/Columns';
import PageLoadingState from '../PageLoadingState';
import PageTitle from '../PageTitle';
import { useWpPage } from '../useWpHooks';
import { WpStyle } from '../WpStyle';
import s from './style.module.css';

type StaticContentPageProps = {
    slugs: { en: string; de: string };
};

export function StaticContentPage({ slugs }: StaticContentPageProps) {
    const { response, isLoading, error } = useWpPage(slugs);
    const { t } = useTranslation();

    if (error) {
        return (
            <>
                <SimpleHeader>{t('common.error.general')}</SimpleHeader>
                {error.message}
            </>
        );
    }

    if (!response || isLoading) {
        return <PageLoadingState />;
    }

    return (
        <>
            <PageTitle title={response.title} />
            <Header>
                <div className={s.title}>{response.title}</div>
            </Header>
            <SingleColumn>
                <WpStyle body={response?.body} />
            </SingleColumn>
        </>
    );
}
