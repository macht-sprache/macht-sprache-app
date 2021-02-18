import { generatePath, useParams } from 'react-router-dom';
import Comments from '../Comments';
import { collections, setRating, useRating, useTerm, useTranslationEntity } from '../hooks/data';
import Header from '../Header';
import { Columns } from '../Layout/Columns';
import { TERM } from '../routes';
import TranslationExamplesList from '../TranslationExamplesList';
import { useUser } from 'reactfire';
import { SmallRatingWidget } from '../Rating/SmallWidget';
import { RATING_STEPS } from '../constants';
import { useState } from 'react';

export function TranslationPage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);
    const user = useUser();
    const rating = useRating(user.data.uid, translationId);

    const [ratingSlider, setRatingSlider] = useState<number | undefined>(
        rating?.rating ? rating.rating * (RATING_STEPS - 1) + 1 : undefined
    );

    const rangeInputProps = {
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
                <SmallRatingWidget
                    rangeInputProps={rangeInputProps}
                    termValue={term.value}
                    lang={translation.lang}
                    ratings={translation.ratings}
                />
            </Header>
            <Columns>
                <TranslationExamplesList term={term} translation={translation} />
                <Comments entityRef={collections.translations.doc(translation.id)} />
            </Columns>
        </>
    );
}
