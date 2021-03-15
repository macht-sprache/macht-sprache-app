import { useTranslation } from 'react-i18next';
import { FormatDate } from '../FormatDate';
import { useWpPosts, WpImage } from '../useWpHooks';
import s from './style.module.css';

const MACHT_SPRACHE_TAGS = { en: '523', de: '520' };

export function NewsFeed() {
    const { t } = useTranslation();
    const { response, isLoading } = useWpPosts(MACHT_SPRACHE_TAGS);

    return (
        <div>
            {isLoading && <>{t('common.loading')}</>}
            {response?.map(({ title, link, excerpt, date, featuredMedia }, index) => (
                <article key={index} className={s.article}>
                    <a href={link} target="_blank" rel="noreferrer" className={s.link}>
                        <h1 className={s.heading} dangerouslySetInnerHTML={{ __html: title }} />
                        <div className={s.body}>
                            {featuredMedia && <WpImage sizes="300px" className={s.image} image={featuredMedia} />}
                            <div>
                                <div className={s.date}>
                                    <FormatDate date={date} />
                                </div>
                                <div className={s.excerpt} dangerouslySetInnerHTML={{ __html: excerpt }} />
                                <div className={s.clickForMore}>{t('newsFeed.clickForMore')}</div>
                            </div>
                        </div>
                    </a>
                </article>
            ))}
        </div>
    );
}
