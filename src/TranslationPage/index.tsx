import { generatePath, useParams } from 'react-router-dom';
import Comments from '../Comments';
import { collections, setRating, useRating, useTerm, useTranslationEntity } from '../hooks/data';
import Header from '../Header';
import { Columns } from '../Layout/Columns';
import { TERM } from '../routes';
import TranslationExamplesList from '../TranslationExamplesList';
import { useUser } from 'reactfire';
import { RatingWidget } from '../Rating/RatingWidget';
import { RATING_STEPS } from '../constants';
import { useState } from 'react';
import s from './style.module.css';

export function TranslationPage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);
    const user = useUser();
    const rating = useRating(user.data?.uid, translationId);

    const [ratingSlider, setRatingSlider] = useState<number | undefined>(
        rating?.rating ? rating.rating * (RATING_STEPS - 1) + 1 : undefined
    );

    const rangeInputProps = user.data && {
        value: ratingSlider,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const ratingFromSlider = parseInt(e.currentTarget.value);
            const rating = (1 / (RATING_STEPS - 1)) * (ratingFromSlider - 1);
            setRatingSlider(ratingFromSlider);
            setRating(user.data.uid, translationId, rating);
        },
    };

    return (
        <>
            <Header
                mainLang={translation.lang}
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: term.value,
                        lang: term.lang,
                    },
                ]}
            >
                {translation.value}
                <div className={s.rating}>
                    <RatingWidget
                        rangeInputProps={rangeInputProps}
                        termValue={term.value}
                        lang={translation.lang}
                        ratings={translation.ratings}
                    />
                </div>
            </Header>
            <Columns>
                <TranslationExamplesList term={term} translation={translation} />
                <Comments entityRef={collections.translations.doc(translation.id)} />
            </Columns>
        </>
    );
}
