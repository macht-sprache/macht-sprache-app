import clsx from 'clsx';
import Tooltip from 'rc-tooltip';
import { useTranslation } from 'react-i18next';
import { RATING_STEPS } from '../constants';
import { useUser } from '../hooks/appContext';
import { setRating, useRating } from '../hooks/data';
import { useRedacted } from '../RedactSensitiveTerms';
import { Term, Translation, User } from '../types';
import { useDomId } from '../useDomId';
import { useLang } from '../useLang';
import s from './style.module.css';

type Sizes = 'small' | 'medium';

type RatingProps = {
    ratings?: number[];
    termValue: string;
    rangeInputProps?: React.InputHTMLAttributes<any>;
    size?: Sizes;
};

export function Rating({
    ratings = new Array(RATING_STEPS).fill(0),
    termValue,
    rangeInputProps,
    size = 'medium',
}: RatingProps) {
    const max = Math.max(...ratings);
    const { t } = useTranslation();
    const [globalLang] = useLang();
    const id = useDomId();
    const sumOfAllRatings = ratings.reduce((a, b) => a + b, 0);
    const ratingTranslations = t('rating.values', { returnObjects: true });

    const distributionLabel = [
        t('rating.ratingDistribution'),
        ...ratings.map((rating, index) => {
            return t('rating.ratingDistributionTimes', {
                times: rating,
                value: ratingTranslations[index],
            });
        }),
    ].join(' ');

    const sliderLabel = [
        t('rating.rangeInputLabel', { from: 1, to: ratings.length, term: termValue }),
        ...ratings.map((rating, index) => {
            return t('rating.scaleDescription', {
                number: index + 1,
                value: ratingTranslations[index],
            });
        }),
    ].join(' ');

    if (size === 'small' && sumOfAllRatings === 0) {
        return null;
    }

    return (
        <div
            className={clsx(s.container, s[size])}
            title={size === 'small' ? distributionLabel : undefined}
            aria-label={size === 'small' ? distributionLabel : undefined}
        >
            <div className={s.ratings} aria-label={distributionLabel}>
                {ratings.map((rating, index) => (
                    <div key={index} style={{ height: `${(rating / max) * 100}%` }} className={s.rating}>
                        {size !== 'small' && (
                            <Tooltip
                                overlay={<span>{t('rating.values', { returnObjects: true })[index]}</span>}
                                placement="top"
                                mouseLeaveDelay={0}
                            >
                                <div className={clsx(s.ratingInner, { [s.inside]: rating / max > 0.5 })}>{rating}</div>
                            </Tooltip>
                        )}
                    </div>
                ))}
                {sumOfAllRatings === 0 && <div className={s.emtpyMessage}>{t('rating.noData')}</div>}
            </div>
            {rangeInputProps && (
                <>
                    <label htmlFor={id('ratingSlider')} lang={globalLang} className={s.hiddenLabel}>
                        {sliderLabel}
                    </label>
                    <input
                        type="range"
                        id={id('ratingSlider')}
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
                            {rangeInputProps.value && (
                                <>
                                    {t('rating.yourRating')}
                                    {
                                        t('rating.values', { returnObjects: true })[
                                            Math.round(rangeInputProps.value as number) - 1
                                        ]
                                    }
                                </>
                            )}
                            {!rangeInputProps.value && <>{t('rating.dragToSet')}</>}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

type RatingContainerProps = {
    term: Term;
    translation: Translation;
    size?: Sizes;
};

export function RatingContainer({ translation, term, size }: RatingContainerProps) {
    const user = useUser();
    const translationValue = useRedacted(translation.value);
    const termValue = useRedacted(term.value);

    if (user) {
        return (
            <RatingLoggedIn
                size={size}
                translationValue={translationValue}
                termValue={termValue}
                term={term}
                translation={translation}
                user={user}
            />
        );
    }

    return <Rating size={size} ratings={translation.ratings ?? undefined} termValue={termValue} />;
}

function RatingLoggedIn({
    translation,
    termValue,
    user,
    size,
}: {
    translationValue: string;
    translation: Translation;
    termValue: string;
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
        <Rating
            ratings={translation.ratings ?? undefined}
            termValue={termValue}
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
