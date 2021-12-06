import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ButtonContainer, ButtonLink } from '../../../components/Form/Button';
import { SingleColumn } from '../../../components/Layout/Columns';
import { MANIFESTO, TEXT_CHECKER } from '../../../routes';
import s from './style.module.css';

export default function TextCheckerAd() {
    const { t } = useTranslation();

    return (
        <SingleColumn>
            <div className={s.container}>
                <h2 className={s.heading}>{t('home.ad.heading')}</h2>
                <p>
                    <Trans
                        i18nKey="home.ad.text"
                        components={{
                            TextCheckerLink: <Link to={TEXT_CHECKER} />,
                            ManifestoLink: <Link to={MANIFESTO} />,
                        }}
                    />
                </p>
                <ButtonContainer>
                    <ButtonLink to={TEXT_CHECKER}>{t('textChecker.title')}</ButtonLink>
                    <ButtonLink to={MANIFESTO}>{t('manifesto.title')}</ButtonLink>
                </ButtonContainer>
            </div>
        </SingleColumn>
    );
}
