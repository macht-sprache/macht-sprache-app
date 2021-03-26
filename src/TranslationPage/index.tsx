import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { useTerm, useTranslationEntity } from '../hooks/data';
import { RatingWidgetContainer } from '../Rating/RatingWidget';
import { Redact } from '../RedactSensitiveTerms';
import { TERM } from '../routes';
import TranslationExamplesList from '../TranslationExamplesList';
import { getDominantLanguageClass } from '../useLangCssVars';
import s from './style.module.css';

export function TranslationPage() {
    const { t } = useTranslation();
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);

    return (
        <>
            <Header
                capitalize
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
                subLine={
                    <Trans
                        t={t}
                        i18nKey="common.addedOn"
                        components={{
                            User: translation.creator.displayName,
                            FormatDate: <FormatDate date={translation.createdAt} />,
                        }}
                    />
                }
            >
                <Redact>{translation.value}</Redact>
            </Header>
            <TranslationExamplesList term={term} translation={translation} />
        </>
    );
}
