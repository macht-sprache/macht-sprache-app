import clsx from 'clsx';
import Tooltip from 'rc-tooltip';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RATING_STEPS } from '../../constants';
import Button, { ButtonContainer } from '../../Form/Button';
import { useUser } from '../../hooks/appContext';
import { setRating, useRating } from '../../hooks/data';
import { ModalDialog } from '../../ModalDialog';
import { useRedacted } from '../../RedactSensitiveTerms';
import { WrappedInLangColor } from '../../TermWithLang';
import { Lang, Term, Translation, User } from '../../types';
import { useDomId } from '../../useDomId';
import { useLang } from '../../useLang';
import { getDominantLanguageClass } from '../../useLangCssVars';
import s from './style.module.css';

type Sizes = 'small' | 'medium' | 'large';

type RatingDisplayProps = {
    ratings?: number[];
    termLang: Lang;
    termValue: string;
    translationValue: string;
    translationLang: Lang;
    rangeInputProps?: React.InputHTMLAttributes<any>;
    size?: Sizes;
};

export function RatingWidget(props: RatingDisplayProps) {
    const { t } = useTranslation();
    const [overlayOpen, setOverlayOpen] = useState(false);
    const unset = !props.rangeInputProps?.value;

    return (
        <div className={s.unsetButtonContainer}>
            <RatingDisplay {...props} />
            {unset && props.size !== 'small' && (
                <button onClick={() => setOverlayOpen(true)} className={s.unsetButton}>
                    {t('rating.clickToSet')}
                </button>
            )}
            {overlayOpen && (
                <ModalDialog
                    title={
                        <Trans
                            t={t}
                            i18nKey="rating.overlayHeading"
                            values={{
                                translation: props.translationValue,
                                term: props.termValue,
                            }}
                            components={{
                                Term: <WrappedInLangColor lang={props.termLang} />,
                                Translation: <WrappedInLangColor lang={props.translationLang} />,
                            }}
                        />
                    }
                    onClose={() => setOverlayOpen(false)}
                >
                    <p>{t('rating.dragToSet')}</p>
                    <div className={getDominantLanguageClass(props.translationLang)}>
                        <RatingDisplay {...props} size="large" />
                    </div>
                    <ButtonContainer>
                        <Button onClick={() => setOverlayOpen(false)} style={{ marginTop: 10 }}>
                            {t('common.formNav.close')}
                        </Button>
                    </ButtonContainer>
                </ModalDialog>
            )}
        </div>
    );
}

function RatingDisplay({
    ratings = new Array(RATING_STEPS).fill(0),
    termValue,
    rangeInputProps,
    size = 'medium',
}: RatingDisplayProps) {
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
            {size === 'large' && (
                <div aria-hidden="true" className={s.permanentSliderLabel}>
                    <div>{ratingTranslations[0]}</div>
                    <div>{ratingTranslations[ratingTranslations.length - 1]}</div>
                </div>
            )}
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
                                    {size !== 'large' && t('rating.yourRating')}
                                    {
                                        t('rating.values', { returnObjects: true })[
                                            Math.round(rangeInputProps.value as number) - 1
                                        ]
                                    }
                                </>
                            )}
                            {!rangeInputProps.value && size !== 'large' && <>{t('rating.dragToSet')}</>}
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
    const translationValue = useRedacted(translation.value);
    const termValue = useRedacted(term.value);

    if (user) {
        return (
            <RatingWidgetLoggedIn
                size={size}
                translationValue={translationValue}
                termValue={termValue}
                term={term}
                translation={translation}
                user={user}
            />
        );
    }

    return (
        <RatingDisplay
            size={size}
            ratings={translation.ratings}
            translationLang={translation.lang}
            translationValue={translationValue}
            termValue={termValue}
            termLang={term.lang}
        />
    );
}

function RatingWidgetLoggedIn({
    translationValue,
    translation,
    termValue,
    term,
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
        <RatingDisplay
            ratings={translation.ratings}
            termValue={termValue}
            termLang={term.lang}
            translationValue={translationValue}
            translationLang={translation.lang}
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
