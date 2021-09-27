import clsx from 'clsx';
import Tooltip from 'rc-tooltip';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RATING_STEPS } from '../../constants';
import { useUser } from '../../hooks/appContext';
import { getRatingRef, setRating } from '../../hooks/data';
import { Get, useDocument } from '../../hooks/fetch';
import { LoginHint } from '../LoginHint';
import { useRedacted } from '../RedactSensitiveTerms';
import { Rating as RatingType, Term, Translation, User } from '../../types';
import { useDomId } from '../../useDomId';
import { useLang } from '../../useLang';
import s from './style.module.css';

type Sizes = 'small' | 'medium';

type RatingProps = {
    ratings?: number[];
    termValue: string;
    rating?: number;
    onChange?: (rating: number) => void;
    size?: Sizes;
};

export function Rating({
    ratings = new Array(RATING_STEPS).fill(0),
    termValue,
    rating,
    onChange,
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

            <label htmlFor={id('ratingSlider')} lang={globalLang} className={s.hiddenLabel}>
                {sliderLabel}
            </label>
            <input
                type="range"
                id={id('ratingSlider')}
                min={1}
                max={ratings.length}
                step={0.1}
                className={clsx(s.rangeInput, { [s.unset]: rating === undefined })}
                value={rating === undefined ? (RATING_STEPS + 1) / 2 : toSliderValue(rating)}
                onChange={onChange ? event => onChange(fromSliderValue(parseFloat(event.target.value))) : undefined}
                disabled={size === 'small' || !onChange}
            />
            {size !== 'small' && (
                <div className={s.userUsageDisplay} lang={globalLang}>
                    {rating === undefined ? (
                        <LoginHint i18nKey="rating.loginHint">{t('rating.dragToSet')}</LoginHint>
                    ) : (
                        <>
                            {t('rating.yourRating')}
                            {t('rating.values', { returnObjects: true })[Math.round(toSliderValue(rating)) - 1]}
                        </>
                    )}
                </div>
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

    const ratingElement = <Rating size={size} ratings={translation.ratings ?? undefined} termValue={termValue} />;

    if (user) {
        return (
            <Suspense fallback={ratingElement}>
                <RatingLoggedIn
                    size={size}
                    translationValue={translationValue}
                    termValue={termValue}
                    term={term}
                    translation={translation}
                    user={user}
                />
            </Suspense>
        );
    }

    return ratingElement;
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
    const getRating = useDocument(getRatingRef(user.id, translation.id));
    const { rating, onChange } = useDebouncedRatingSaving(getRating, user.id, translation.id);

    return (
        <Rating
            ratings={translation.ratings ?? undefined}
            termValue={termValue}
            rating={rating}
            onChange={onChange}
            size={size}
        />
    );
}

function useDebouncedRatingSaving(getRating: Get<RatingType>, userId: string, translationId: string) {
    const rating = getRating(true);
    const ratingRef = useRef(rating?.rating);
    const localRatingRef = useRef(rating?.rating);
    const [localRating, setLocalRating] = useState(rating?.rating);
    const isSavingRef = useRef(false);

    const save = useCallback((newRating: number) => setRating(userId, translationId, newRating), [
        translationId,
        userId,
    ]);

    useEffect(() => {
        ratingRef.current = rating?.rating;
        if (!isSavingRef.current && rating?.rating !== localRatingRef.current) {
            setLocalRating(rating?.rating);
        }
    }, [rating?.rating]);

    useEffect(() => {
        isSavingRef.current = true;
        localRatingRef.current = localRating;
        const timeoutId = window.setTimeout(() => {
            if (localRating !== undefined && localRating !== ratingRef.current) {
                save(localRating);
            }
            isSavingRef.current = false;
        }, 500);
        return () => window.clearTimeout(timeoutId);
    }, [localRating, save]);

    useEffect(
        () => () => {
            if (localRatingRef.current !== undefined && localRatingRef.current !== ratingRef.current) {
                save(localRatingRef.current);
            }
        },
        [save]
    );

    return { rating: localRating, onChange: setLocalRating };
}

function toSliderValue(rating: number) {
    return rating * (RATING_STEPS - 1) + 1;
}

function fromSliderValue(rating: number) {
    return (rating - 1) / (RATING_STEPS - 1);
}
