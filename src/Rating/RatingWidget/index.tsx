import clsx from 'clsx';
import { Lang, Term, Translation, User } from '../../types';
import s from './style.module.css';
import Tooltip from 'rc-tooltip';
import { Trans, useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { useLang } from '../../useLang';
import { RATING_STEPS } from '../../constants';
import { setRating, useRating } from '../../hooks/data';
import { useUser } from '../../hooks/auth';
import { useButton } from '@react-aria/button';
import { ModalDialog } from '../../ModalDialog';
import Button, { ButtonContainer } from '../../Form/Button';
import { WrappedInLangColor } from '../../TermWithLang';

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

export function RatingWidget({ ...ratingDisplayProps }: RatingDisplayProps) {
    const { t } = useTranslation();
    const [overlayOpen, setOverlayOpen] = useState(false);
    let openButtonRef = useRef<HTMLElement>(null);
    let closeButtonRef = useRef<HTMLButtonElement>(null);

    // useButton ensures that focus management is handled correctly,
    // across all browsers. Focus is restored to the button once the
    // dialog closes.
    let { buttonProps: openButtonProps } = useButton(
        {
            onPress: () => setOverlayOpen(true),
        },
        openButtonRef
    );

    let { buttonProps: closeButtonProps } = useButton(
        {
            onPress: () => setOverlayOpen(false),
        },
        closeButtonRef
    );

    const unset = !ratingDisplayProps?.rangeInputProps?.value;

    return (
        <div className={s.unsetButtonContainer}>
            <RatingDisplay {...ratingDisplayProps} />
            {unset && (
                <button {...openButtonProps} className={s.unsetButton}>
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
                                translation: ratingDisplayProps.translationValue,
                                term: ratingDisplayProps.termValue,
                            }}
                            components={{
                                Term: <WrappedInLangColor lang={ratingDisplayProps.termLang} />,
                                Translation: <WrappedInLangColor lang={ratingDisplayProps.translationLang} />,
                            }}
                        />
                    }
                    isOpen
                    onClose={() => setOverlayOpen(false)}
                    isDismissable
                >
                    <RatingDisplay {...ratingDisplayProps} size="large" />
                    <ButtonContainer>
                        <Button {...closeButtonProps} ref={closeButtonRef} style={{ marginTop: 10 }}>
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
    const [domIdInput] = useState('idInput_' + Math.random());
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
            <div className={s.ratings} aria-label={distributionLabel} lang={globalLang}>
                {ratings.map((rating, index) => (
                    <div key={index} style={{ height: `${(rating / max) * 100}%` }} className={s.rating}>
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
            {size === 'large' && (
                <div aria-hidden="true" className={s.permanentSliderLabel}>
                    <div>{ratingTranslations[0]}</div>
                    <div>{ratingTranslations[ratingTranslations.length - 1]}</div>
                </div>
            )}
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
                                    {size !== 'large' && t('rating.yourRating')}
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

    return (
        <RatingDisplay
            size={size}
            ratings={translation.ratings}
            translationLang={translation.lang}
            translationValue={translation.value}
            termValue={term.value}
            termLang={term.lang}
        />
    );
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
            termValue={term.value}
            termLang={term.lang}
            translationValue={translation.value}
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
