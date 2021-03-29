import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { useTerm, useTranslationEntity } from '../hooks/data';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import { RatingWidgetContainer } from '../Rating/RatingWidget';
import { Redact } from '../RedactSensitiveTerms';
import { TERM } from '../routes';
import { WrappedInLangColor } from '../TermWithLang';
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
            <SingleColumn>
                <ColumnHeading>{t('rating.heading')}</ColumnHeading>
                <p>
                    <Trans
                        t={t}
                        i18nKey="rating.overlayHeading"
                        values={{
                            translation: translation.value,
                            term: term.value,
                        }}
                        components={{
                            Term: <WrappedInLangColor lang={term.lang} />,
                            Translation: <WrappedInLangColor lang={translation.lang} />,
                        }}
                    />
                </p>
                <div className={clsx(s.rating, getDominantLanguageClass(translation.lang))}>
                    <div className={s.ratingInner}>
                        <RatingWidgetContainer term={term} translation={translation} />
                    </div>
                </div>
            </SingleColumn>

            <TranslationExamplesList term={term} translation={translation} />
        </>
    );
}
