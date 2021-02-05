import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { useUser } from '../hooks/auth';
import { auth } from '../firebase';
import { langA, langB } from '../languages';
import LinkButton from '../LinkButton';
import { LOGIN, REGISTER } from '../routes';
import { useLang } from '../useLang';

export function TopMenu() {
    const user = useUser();
    const { t } = useTranslation();
    const logout = useCallback(() => {
        auth.signOut();
    }, []);

    if (user) {
        return (
            <>
                <LanguageSwitcher /> {user.displayName} <LinkButton onClick={logout}>{t('auth.logout')}</LinkButton>
            </>
        );
    } else {
        return (
            <>
                <LanguageSwitcher /> <Link to={generatePath(REGISTER)}>{t('auth.register')}</Link>{' '}
                <Link to={generatePath(LOGIN)}>{t('auth.login')}</Link>
            </>
        );
    }
}

function LanguageSwitcher() {
    const [lang, setLang] = useLang();
    const otherLang = lang === langA ? langB : langA;

    return <LinkButton onClick={() => setLang(otherLang)}>{otherLang}</LinkButton>;
}
