import { Lang, Rating } from '../../types';
import s from './style.module.css';

type SmallRatingWidgetProps = {
    ratings: number[];
    lang: Lang;
    userRating?: Rating;
};

export function SmallRatingWidget({ ratings, userRating, lang }: SmallRatingWidgetProps) {
    const max = Math.max(...ratings);
    const columnWidth = 1 / ratings.length;

    return (
        <div className={s.container} lang={lang}>
            <div className={s.ratings}>
                {ratings.map((rating, index) => (
                    <div key={index} style={{ height: `${(rating / max) * 100}%` }} className={s.rating} />
                ))}
            </div>
            {userRating && (
                <div
                    className={s.userRating}
                    style={{ left: `${(userRating.rating * (1 - columnWidth) + columnWidth / 2) * 100}%` }}
                />
            )}
        </div>
    );
}
