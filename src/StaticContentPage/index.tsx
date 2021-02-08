import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { useWp } from '../useWpHooks';

type StaticContentPageProps = {
    slugs: { en: string; de: string };
};

export function StaticContentPage({ slugs }: StaticContentPageProps) {
    const { response, isLoading, error } = useWp(slugs);
    const { t } = useTranslation();

    if (error) {
        return (
            <>
                <Header>{t('common.error.general')}</Header>
                {error.message}
            </>
        );
    }

    if (!response || isLoading) {
        return <Header>{t('common.loading')}</Header>;
    }

    return (
        <>
            <Header>{response.title}</Header>
            <div dangerouslySetInnerHTML={{ __html: response.body }} />
        </>
    );
}
