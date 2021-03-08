import clsx from 'clsx';
import { generatePath, useParams } from 'react-router-dom';
import Comments from '../Comments';
import Header from '../Header';
import { collections, useTerm, useTranslationEntity } from '../hooks/data';
import { Columns } from '../Layout/Columns';
import { RatingWidgetContainer } from '../Rating/RatingWidget';
import { Redact } from '../RedactSensitiveTerms';
import { TERM } from '../routes';
import TranslationExamplesList from '../TranslationExamplesList';
import { getDominantLanguageClass } from '../useLangCssVars';
import s from './style.module.css';

export function TranslationPage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);

    return (
        <>
            <Header
                mainLang={translation.lang}
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: <Redact>{term.value}</Redact>,
                        lang: term.lang,
                    },
                ]}
                rating={
                    <div className={clsx(s.rating, getDominantLanguageClass(translation.lang))}>
                        <RatingWidgetContainer term={term} translation={translation} />
                    </div>
                }
            >
                <Redact>{translation.value}</Redact>
            </Header>
            <Columns>
                <TranslationExamplesList term={term} translation={translation} />
                <div className={getDominantLanguageClass(translation.lang)}>
                    <Comments entityRef={collections.translations.doc(translation.id)} />
                </div>
            </Columns>
        </>
    );
}
