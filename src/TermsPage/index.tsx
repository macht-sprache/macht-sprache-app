import { useTranslation } from 'react-i18next';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import Header from '../Header';
import { SingleColumn } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { TERM_ADD } from '../routes';
import { TermsBig } from '../Terms/TermsBig';

export function TermsPage() {
    const { t } = useTranslation();
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
            <SingleColumn>
                <TermsBig />
            </SingleColumn>
        </>
    );
}
