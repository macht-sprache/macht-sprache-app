import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { useWp } from '../useWpHooks';

type StaticContentPageProps = {
    slugs: { en: string; de: string };
};

export function StaticContentPage({ slugs }: StaticContentPageProps) {
    const [content] = useWp(slugs);
    const { t } = useTranslation();

    if (!content) {
        return <>{t('common.loading')}</>;
    }

    if (content?.length === 0) {
        return <>not found, something went wrong.</>;
    }

    return (
        <>
            <Header>{content[0].title.rendered}</Header>
            <div dangerouslySetInnerHTML={{ __html: content[0].content.rendered }} />
        </>
    );
}
