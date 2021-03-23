import { useTranslation } from 'react-i18next';
import { ButtonAnchor } from '../Form/Button';
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
                <article
                    key={index}
                    className={s.article}
                    onClick={() => {
                        window.open(link);
                    }}
                >
                    <h1 className={s.heading}>
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className={s.link}
                            dangerouslySetInnerHTML={{ __html: title }}
                        />
                    </h1>
                    {featuredMedia && <WpImage sizes="600px" className={s.image} image={featuredMedia} />}
                    <div className={s.body}>
                        <div className={s.date}>
                            <FormatDate date={date} />
                        </div>
                        <div className={s.excerpt} dangerouslySetInnerHTML={{ __html: excerpt }} />
                        <ButtonAnchor href={link} target="_blank" rel="noreferrer" className={s.clickForMore}>
                            {t('newsFeed.clickForMore')}
                        </ButtonAnchor>
                    </div>
                </article>
            ))}
        </div>
    );
}
