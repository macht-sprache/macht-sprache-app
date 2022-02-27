import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { useUser } from '../../hooks/appContext';
import { useFirebaseAuth } from '../../hooks/auth';
import { useAddContinueParam } from '../../hooks/location';
import { langA, langB } from '../../languages';
import { LOGIN, REGISTER, USER } from '../../routes';
import { useLang } from '../../useLang';
import { useLaunched } from '../../useLaunched';
import LinkButton from '../LinkButton';

export function TopMenu() {
    const auth = useFirebaseAuth();
    const user = useUser();
    const { t } = useTranslation();
    const launched = useLaunched();
    const addContinueParam = useAddContinueParam();
    const logout = useCallback(() => {
        auth.signOut();
    }, [auth]);

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
