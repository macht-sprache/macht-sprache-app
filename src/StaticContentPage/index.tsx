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

    return (
        <>
            <Header>{content.title.rendered}</Header>
            <div dangerouslySetInnerHTML={{ __html: content.content.rendered }} />
        </>
    );
}
