import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useUser } from '../hooks/auth';
import { useAddContinueParam } from '../hooks/location';
import { langA, langB } from '../languages';
import LinkButton from '../LinkButton';
import { ABOUT, LOGIN, REGISTER } from '../routes';
import { useLang } from '../useLang';

export function TopMenu() {
    const user = useUser();
    const { t } = useTranslation();
    const addContinueParam = useAddContinueParam();
    const logout = useCallback(() => {
        auth.signOut();
    }, []);

    return (
        <>
            <Link to={ABOUT}>{t('nav.about')}</Link> <LanguageSwitcher />{' '}
            {user ? (
                <>
                    {user.displayName} <LinkButton onClick={logout}>{t('auth.logout')}</LinkButton>
                </>
            ) : (
                <>
                    <Link to={addContinueParam(generatePath(REGISTER))}>{t('auth.register')}</Link>{' '}
                    <Link to={addContinueParam(generatePath(LOGIN))}>{t('auth.login')}</Link>
                </>
            )}
        </>
    );
}

function LanguageSwitcher() {
    const [lang, setLang] = useLang();
    const otherLang = lang === langA ? langB : langA;

    return <LinkButton onClick={() => setLang(otherLang)}>{otherLang}</LinkButton>;
}
