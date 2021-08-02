import { useTranslation } from 'react-i18next';
import { ButtonAnchor } from '../Form/Button';
import { FormatDate } from '../FormatDate';
import { WpMedia, WpPost } from '../hooks/wp';
import { stopPropagation } from '../utils';
import s from './style.module.css';

export const MACHT_SPRACHE_TAGS = { en: '523', de: '520' };

type Props = {
    getPosts: () => WpPost[];
};

export function NewsFeed({ getPosts }: Props) {
    const { t } = useTranslation();
    const posts = getPosts();

    return (
        <>
            {posts.map(({ title, link, excerpt, date, featuredMedia }, index) => (
                <article key={index} className={s.article} onClick={() => window.open(link)}>
                    <h1 className={s.heading}>
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className={s.link}
                            dangerouslySetInnerHTML={{ __html: title }}
                            onClick={stopPropagation}
                        />
                    </h1>
                    {featuredMedia && <WpImage sizes="600px" className={s.image} image={featuredMedia} />}
                    <div className={s.body}>
                        <div className={s.date}>
                            <FormatDate date={date} />
                        </div>
                        <div className={s.excerpt} dangerouslySetInnerHTML={{ __html: excerpt }} />
                        <ButtonAnchor
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={stopPropagation}
                            className={s.clickForMore}
                        >
                            {t('newsFeed.clickForMore')}
                        </ButtonAnchor>
                    </div>
                </article>
            ))}
        </>
    );
}

interface WpImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    image: WpMedia;
}

export function WpImage({ image, ...props }: WpImageProps) {
    const srcSet = image.sizes.map(size => `${size.source_url} ${size.width}w`).join(', ');

    return <img width={image.width} height={image.height} alt="" srcSet={srcSet} {...props} />;
}
