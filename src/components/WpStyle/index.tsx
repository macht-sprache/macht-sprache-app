import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import s from './style.module.css';

type WpStyleProps = {
    body?: string;
};

const useReplaceYoutubeEmbeds = (html: string) =>
    useMemo(() => html.replace(/https:\/\/www\.youtube\.com\/embed\//g, 'https://www.youtube-nocookie.com/embed/'), [
        html,
    ]);

const Container = ({ body }: { body: string }) => (
    <div className={s.container} dangerouslySetInnerHTML={{ __html: useReplaceYoutubeEmbeds(body) }} />
);

export function WpStyle({ body }: WpStyleProps) {
    const { t } = useTranslation();
    return <>{body ? <Container body={body} /> : <>{t('common.loading')}</>}</>;
}
