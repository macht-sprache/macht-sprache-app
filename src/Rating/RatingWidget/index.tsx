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

type Sizes = 'small' | 'medium';

type RatingWidgetProps = {
    ratings?: number[];
    lang: Lang;
    termValue: string;
    rangeInputProps?: React.InputHTMLAttributes<any>;
    size?: Sizes;
};

export function RatingWidget({
    ratings = new Array(RATING_STEPS).fill(0),
    lang,
    termValue,
    rangeInputProps,
    size = 'medium',
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
        <div
            className={clsx(s.container, s[size])}
            lang={lang}
            title={size === 'small' ? distributionLabel : undefined}
            aria-label={size === 'small' ? distributionLabel : undefined}
        >
            <div className={s.ratings} aria-label={distributionLabel} lang={globalLang}>
                {ratings.map((rating, index) => (
                    <div lang={lang} key={index} style={{ height: `${(rating / max) * 100}%` }} className={s.rating}>
                        {size !== 'small' && (
                            <Tooltip
                                overlay={t('rating.values', { returnObjects: true })[index]}
                                placement="top"
                                mouseLeaveDelay={0}
                            >
                                <div className={clsx(s.ratingInner, { [s.inside]: rating / max > 0.5 })}>{rating}</div>
                            </Tooltip>
                        )}
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
                        disabled={size === 'small'}
                    />
                    {size !== 'small' && (
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
                    )}
                </>
            )}
        </div>
    );
}

type RatingWidgetContainerProps = {
    term: Term;
    translation: Translation;
    size?: Sizes;
};

export function RatingWidgetContainer({ translation, term, size }: RatingWidgetContainerProps) {
    const user = useUser();

    if (user) {
        return <RatingWidgetLoggedIn size={size} term={term} translation={translation} user={user} />;
    }

    return <RatingWidget size={size} ratings={translation.ratings} lang={translation.lang} termValue={term.value} />;
}

function RatingWidgetLoggedIn({
    translation,
    term,
    user,
    size,
}: {
    translation: Translation;
    term: Term;
    user: User;
    size?: Sizes;
}) {
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
            size={size}
        />
    );
}

function toSliderValue(rating: number) {
    return rating * (RATING_STEPS - 1) + 1;
}

function fromSliderValue(rating: number) {
    return (rating - 1) / (RATING_STEPS - 1);
}
