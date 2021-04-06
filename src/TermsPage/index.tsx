import { useTranslation } from 'react-i18next';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import Header from '../Header';
import { collections } from '../hooks/data';
import { useCollection } from '../hooks/fetch';
import { FullWidthColumn, SingleColumn } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { TERM_ADD } from '../routes';
import { TermsBig } from '../Terms/TermsBig';

export function TermsPage() {
    const { t } = useTranslation();
    const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', false));

    return (
        <>
            <Header
                subLine={
                    <LoginHint i18nKey="term.registerToAdd">
                        <ButtonContainer align="left">
                            <ButtonLink to={TERM_ADD}>{t('common.entities.term.add')}</ButtonLink>
                        </ButtonContainer>
                    </LoginHint>
                }
            >
                {t('common.entities.term.value_plural')}
            </Header>

            <FullWidthColumn>
                <TermsBig getTerms={getTerms} />
            </FullWidthColumn>

            <SingleColumn>
                <ButtonContainer align="left">
                    <ButtonLink to={TERM_ADD}>{t('common.entities.term.add')}</ButtonLink>
                </ButtonContainer>
            </SingleColumn>
        </>
    );
}
