import { Trans, useTranslation } from 'react-i18next';
import { CommentWrapper } from '../Comments/CommentWrapper';
import Button, { ButtonContainer } from '../Form/Button';
import { ColumnHeading } from '../Layout/Columns';
import { TermWithLang } from '../TermWithLang';
import { Term } from '../types';

type tranlsationExamplesListProps = {
    term: Term;
};

export function TranlsationExamplesList({ term }: tranlsationExamplesListProps) {
    const { t } = useTranslation();

    return (
        <CommentWrapper>
            <ColumnHeading>{t('common.entities.translatioExample.value_plural')}</ColumnHeading>
            <div>
                <Trans
                    t={t}
                    i18nKey={'translationExample.empty'}
                    components={{ Term: <TermWithLang lang={term.lang}>foo</TermWithLang> }}
                    values={{ term: term.value }}
                />
            </div>
            <ButtonContainer align="left">
                <Button>{t('common.entities.translatioExample.add')}</Button>
            </ButtonContainer>
        </CommentWrapper>
    );
}