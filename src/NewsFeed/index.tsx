import { useTranslation } from 'react-i18next';
import { FormatDate } from '../FormatDate';
import { useWpPosts } from '../useWpHooks';
import s from './style.module.css';

const MACHT_SPRACHE_TAGS = { en: '523', de: '520' };

export function NewsFeed() {
    const { t } = useTranslation();
    const { response } = useWpPosts(MACHT_SPRACHE_TAGS);

    return (
        <div>
            {response?.map(({ title, link, excerpt, date }, index) => (
                <article key={index} className={s.article}>
                    <a href={link} target="_blank" rel="noreferrer" className={s.link}>
                        <h1 className={s.heading}>{title}</h1>
                        <div className={s.date}>
                            <FormatDate date={date} />
                        </div>
                        <div className={s.excerpt} dangerouslySetInnerHTML={{ __html: excerpt }} />
                        <div className={s.clickForMore}>{t('newsFeed.clickForMore')}</div>
                    </a>
                </article>
            ))}
        </div>
    );
}
