import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ButtonContainer, ButtonLink } from '../../../components/Form/Button';
import { FullWidthColumn } from '../../../components/Layout/Columns';
import { EXTENSION, MANIFESTO, TEXT_CHECKER } from '../../../routes';
import s from './style.module.css';
import Illustration from './illustration.jpg';

export default function TextCheckerAd() {
    const { t } = useTranslation();

    return (
        <FullWidthColumn>
            <div className={s.container}>
                <h2 className={s.heading}>{t('home.ad.heading')}</h2>
                <div className={s.body}>
                    <img src={Illustration} className={s.image} alt="" width="700" height="700" />
                    <div className={s.bodyText}>
                        <p className={s.bodyParagraph}>
                            <Trans
                                i18nKey="home.ad.text"
                                components={{
                                    TextCheckerLink: <Link to={TEXT_CHECKER} />,
                                    ManifestoLink: <Link to={MANIFESTO} />,
                                    ExtensionLink: <Link to={EXTENSION} />,
                                }}
                            />
                        </p>

                        <ButtonContainer>
                            <ButtonLink to={TEXT_CHECKER}>{t('textChecker.title')}</ButtonLink>
                            <ButtonLink to={MANIFESTO}>{t('manifesto.title')}</ButtonLink>
                            <ButtonLink to={EXTENSION}>Browser Extension</ButtonLink>
                        </ButtonContainer>
                    </div>
                </div>
            </div>
        </FullWidthColumn>
    );
}
