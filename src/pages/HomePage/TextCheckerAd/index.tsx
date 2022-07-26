import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ButtonContainer, ButtonLink } from '../../../components/Form/Button';
import { Columns } from '../../../components/Layout/Columns';
import { EXTENSION, MANIFESTO, TEXT_CHECKER } from '../../../routes';
import s from './style.module.css';
import Illustration from './illustration.jpg';
import Extension from './extension.jpg';

export default function TextCheckerAd() {
    const { t } = useTranslation();

    return (
        <Columns>
            <div className={s.container}>
                <h2 className={s.heading}>{t('home.ad.heading.automatically')}</h2>
                <div className={s.body}>
                    <img src={Extension} className={s.image} alt="" width="1000" height="519" />
                    <div className={s.bodyText}>
                        <p className={s.bodyParagraph}>
                            <Trans
                                i18nKey="home.ad.text.automatically"
                                components={{
                                    TextCheckerLink: <Link to={TEXT_CHECKER} />,
                                    ExtensionLink: <Link to={EXTENSION} />,
                                }}
                            />
                        </p>

                        <ButtonContainer>
                            <ButtonLink to={TEXT_CHECKER}>{t('textChecker.title')}</ButtonLink>
                            <ButtonLink to={EXTENSION}>Browser Extension</ButtonLink>
                        </ButtonContainer>
                    </div>
                </div>
            </div>
            <div className={s.container}>
                <h2 className={s.heading}>{t('home.ad.heading.manifesto')}</h2>
                <div className={s.body}>
                    <img src={Illustration} className={s.image} alt="" width="700" height="700" />
                    <div className={s.bodyText}>
                        <p className={s.bodyParagraph}>
                            <Trans
                                i18nKey="home.ad.text.manifesto"
                                components={{
                                    ManifestoLink: <Link to={MANIFESTO} />,
                                }}
                            />
                        </p>

                        <ButtonContainer>
                            <ButtonLink to={MANIFESTO}>{t('manifesto.title')}</ButtonLink>
                        </ButtonContainer>
                    </div>
                </div>
            </div>
        </Columns>
    );
}
