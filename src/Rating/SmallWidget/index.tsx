import clsx from 'clsx';
import { Lang, Rating } from '../../types';
import s from './style.module.css';
import Tooltip from 'rc-tooltip';
import { useTranslation } from 'react-i18next';

type SmallRatingWidgetProps = {
    ratings: number[];
    lang: Lang;
    termValue: string;
    userRating?: Rating;
};

export function SmallRatingWidget({ ratings, userRating, lang, termValue }: SmallRatingWidgetProps) {
    const max = Math.max(...ratings);
    const columnWidth = 1 / ratings.length;
    const { t } = useTranslation();
    if (userRating) {
        console.log((ratings.length - 1) * userRating.rating);
    }

    return (
        <div className={s.container} lang={lang}>
            <div className={s.ratings}>
                {ratings.map((rating, index) => (
                    <div key={index} style={{ height: `${(rating / max) * 100}%` }} className={s.rating}>
                        <Tooltip
                            overlay={t('rating.values', { returnObjects: true })[index]}
                            placement="top"
                            mouseLeaveDelay={0}
                        >
                            <div className={clsx(s.ratingInner, { [s.inside]: rating / max > 0.5 })}>{rating}</div>
                        </Tooltip>
                    </div>
                ))}
            </div>
            {userRating && (
                <Tooltip
                    overlay={
                        t('rating.yourRating', { term: termValue }) +
                        t('rating.values', { returnObjects: true })[(ratings.length - 1) * userRating.rating]
                    }
                    placement="bottom"
                    mouseLeaveDelay={0}
                >
                    <div
                        className={s.userRating}
                        style={{ left: `${(userRating.rating * (1 - columnWidth) + columnWidth / 2) * 100}%` }}
                    />
                </Tooltip>
            )}
        </div>
    );
}
