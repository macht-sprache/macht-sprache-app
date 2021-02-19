import clsx from 'clsx';
import { Lang, Term, Translation, User } from '../../types';
import s from './style.module.css';
import Tooltip from 'rc-tooltip';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useLang } from '../../useLang';
import { RATING_STEPS } from '../../constants';
import { setRating, useRating } from '../../hooks/data';
import { useUser } from '../../hooks/auth';

type RatingWidgetProps = {
    ratings?: number[];
    lang: Lang;
    termValue: string;
    rangeInputProps?: React.InputHTMLAttributes<any>;
};

export function RatingWidget({
    ratings = new Array(RATING_STEPS).fill(0),
    lang,
    termValue,
    rangeInputProps,
}: RatingWidgetProps) {
    const max = Math.max(...ratings);
    const { t } = useTranslation();
    const [globalLang] = useLang();
    const [domIdInput] = useState('idInput_' + Math.random());

    const distributionLabel = [
        t('rating.ratingDistribution'),
        ...ratings.map((rating, index) => {
            return t('rating.ratingDistributionTimes', {
                times: rating,
                value: t('rating.values', { returnObjects: true })[index],
            });
        }),
    ].join(' ');

    const sliderLabel = [
        t('rating.rangeInputLabel', { from: 1, to: ratings.length, term: termValue }),
        ...ratings.map((rating, index) => {
            return t('rating.scaleDescription', {
                number: index + 1,
                value: t('rating.values', { returnObjects: true })[index],
            });
        }),
    ].join(' ');

    return (
        <div className={s.container} lang={lang}>
            <div className={s.ratings} aria-label={distributionLabel} lang={globalLang}>
                {ratings.map((rating, index) => (
                    <div lang={lang} key={index} style={{ height: `${(rating / max) * 100}%` }} className={s.rating}>
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
            {rangeInputProps && (
                <>
                    <label htmlFor={domIdInput} lang={globalLang} className={s.hiddenLabel}>
                        {sliderLabel}
                    </label>
                    <input
                        type="range"
                        list={domIdInput}
                        min={1}
                        max={ratings.length}
                        step={0.1}
                        className={clsx(s.rangeInput, { [s.unset]: !rangeInputProps?.value })}
                        {...rangeInputProps}
                        value={
                            typeof rangeInputProps.value !== 'undefined'
                                ? rangeInputProps.value
                                : (RATING_STEPS + 1) / 2
                        }
                    />
                    <div className={s.userUsageDisplay} lang={globalLang}>
                        {rangeInputProps.value ? (
                            <>
                                {t('rating.yourRating')}
                                {
                                    t('rating.values', { returnObjects: true })[
                                        Math.round(rangeInputProps.value as number) - 1
                                    ]
                                }
                            </>
                        ) : (
                            <>{t('rating.dragToSet')}</>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

type RatingWidgetContainerProps = {
    term: Term;
    translation: Translation;
};

export function RatingWidgetContainer({ translation, term }: RatingWidgetContainerProps) {
    const user = useUser();

    if (user) {
        return <RatingWidgetLoggedIn term={term} translation={translation} user={user} />;
    }

    return <RatingWidget ratings={translation.ratings} lang={translation.lang} termValue={term.value} />;
}

function RatingWidgetLoggedIn({ translation, term, user }: { translation: Translation; term: Term; user: User }) {
    const rating = useRating(user?.id, translation.id);

    const rangeInputProps = user && {
        value: typeof rating?.rating !== 'undefined' ? toSliderValue(rating.rating) : undefined,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const ratingFromSlider = parseFloat(e.currentTarget.value);
            setRating(user.id, translation.id, fromSliderValue(ratingFromSlider));
        },
    };

    return (
        <RatingWidget
            ratings={translation.ratings}
            lang={translation.lang}
            termValue={term.value}
            rangeInputProps={rangeInputProps}
        />
    );
}

function toSliderValue(rating: number) {
    return rating * (RATING_STEPS - 1) + 1;
}

function fromSliderValue(rating: number) {
    return (rating - 1) / (RATING_STEPS - 1);
}
