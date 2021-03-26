import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button, { ButtonContainer } from '../../Form/Button';
import { Checkbox } from '../../Form/Checkbox';
import { Input } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import { ColumnHeading, Columns } from '../../Layout/Columns';
import { NewsFeed } from '../../NewsFeed';
import { IMPRINT, PRIVACY } from '../../routes';
import { useWpPage } from '../../useWpHooks';
import { HomePageHeader } from '../Header';
import s from './style.module.css';

const ABOUT_SLUGS = {
    en: 'about-macht-sprache-short-version-landing-page',
    de: 'ueber-macht-sprache-kurzversion-startseite',
};

export function HomePagePreLaunch() {
    const { t } = useTranslation();
    const { response } = useWpPage(ABOUT_SLUGS);

    return (
        <>
            <HomePageHeader />
            <Columns>
                <div>
                    {/* <div className={s.signUpBox}>
                        <ColumnHeading>{t('home.signUpPreLaunch')}</ColumnHeading>
                        <p className={s.text}>{t('home.signUpPreLaunchDescription')}</p>
                        <p className={s.text}>
                            <Trans
                                t={t}
                                i18nKey="auth.register.termsAndPrivacy"
                                components={{ TermsLink: <Link to={IMPRINT} />, PrivacyLink: <Link to={PRIVACY} /> }}
                            />
                        </p>
                        <SignUp />
                    </div> */}
                    <ColumnHeading>{t('home.about')}</ColumnHeading>
                    <div
                        className={s.text}
                        dangerouslySetInnerHTML={{ __html: response ? response.body : t('common.loading') }}
                    />
                </div>
                <div>
                    <ColumnHeading>{t('home.news')}</ColumnHeading>
                    <div className={s.newsFeed}>
                        <NewsFeed />
                    </div>
                </div>
            </Columns>
        </>
    );
}

// function SignUp() {
//     const { t } = useTranslation();

//     return (
//         <div className={s.signUpForm}>
//             <InputContainer>
//                 <Input label={t('auth.email')} />
//             </InputContainer>
//             <Checkbox label="poco.lit.-newsletter" />
//             <ButtonContainer>
//                 <Button>{t('auth.register.title')}</Button>
//             </ButtonContainer>
//         </div>
//     );
// }
