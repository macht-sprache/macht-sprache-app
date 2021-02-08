import { Fragment } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CommentWrapper } from '../Comments/CommentWrapper';
import Button, { ButtonContainer } from '../Form/Button';
import { useTranslationExamples } from '../hooks/data';
import { ColumnHeading } from '../Layout/Columns';
import { TermWithLang } from '../TermWithLang';
import TextWithHighlights from '../TextWithHighlights';
import { Term, Translation } from '../types';

type Props = {
    term: Term;
    translation: Translation;
};

export default function TranslationExamplesList({ term, translation }: Props) {
    const { t } = useTranslation();
    const translationExamples = useTranslationExamples(translation.id);

    return (
        <CommentWrapper>
            <ColumnHeading>{t('common.entities.translatioExample.value_plural')}</ColumnHeading>
            {!translationExamples.length && (
                <div>
                    <Trans
                        t={t}
                        i18nKey={'translationExample.empty'}
                        components={{ Term: <TermWithLang lang={term.lang}>foo</TermWithLang> }}
                        values={{ term: term.value }}
                    />
                </div>
            )}
            {!!translationExamples.length && (
                <ul>
                    {translationExamples.map(translationExample => (
                        <Fragment key={translationExample.id}>
                            <li lang={term.lang}>
                                <TextWithHighlights
                                    text={translationExample.original.text}
                                    highlighted={translationExample.original.matches}
                                />
                            </li>
                            <li lang={translation.lang}>
                                <TextWithHighlights
                                    text={translationExample.translated.text}
                                    highlighted={translationExample.translated.matches}
                                />
                            </li>
                        </Fragment>
                    ))}
                </ul>
            )}
            <ButtonContainer align="left">
                <Button>{t('common.entities.translatioExample.add')}</Button>
            </ButtonContainer>
        </CommentWrapper>
    );
}
