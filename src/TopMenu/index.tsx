import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useUser } from '../hooks/appContext';
import { useAddContinueParam } from '../hooks/location';
import { langA, langB } from '../languages';
import LinkButton from '../LinkButton';
import { LOGIN, REGISTER, USER } from '../routes';
import { useLang } from '../useLang';
import { useLaunched } from '../useLaunched';

export function TopMenu() {
    const user = useUser();
    const { t } = useTranslation();
    const launched = useLaunched();
    const addContinueParam = useAddContinueParam();
    const logout = useCallback(() => {
        auth.signOut();
    }, []);

    return (
        <>
            <LanguageSwitcher />{' '}
            {user ? (
                <>
                    <Link to={generatePath(USER, { userId: user.id })}>{user.displayName}</Link>{' '}
                    <LinkButton onClick={logout}>{t('auth.logout')}</LinkButton>
                </>
            ) : (
                <>
                    {launched && (
                        <>
                            <Link to={addContinueParam(generatePath(REGISTER))}>{t('auth.register.title')}</Link>{' '}
                        </>
                    )}
                    <Link to={addContinueParam(generatePath(LOGIN))}>{t('auth.login')}</Link>
                </>
            )}
        </>
    );
}

function LanguageSwitcher() {
    const { t } = useTranslation();
    const [lang, setLang] = useLang();
    const otherLang = lang === langA ? langB : langA;

    return (
        <LinkButton onClick={() => setLang(otherLang)} title={t('common.langLabels.switchLang')}>
            {otherLang}
        </LinkButton>
    );
}
