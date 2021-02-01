import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../authHooks';
import { auth } from '../firebase';
import { langA, langB } from '../languages';
import LinkButton from '../LinkButton';
import { useLang } from '../useLang';

export function TopMenu() {
    const user = useUser();
    const logout = useCallback(() => {
        auth.signOut();
    }, []);

    if (user) {
        return (
            <>
                <LanguageSwitcher /> {user.displayName} <LinkButton onClick={logout}>Logout</LinkButton>
            </>
        );
    } else {
        return (
            <>
                <LanguageSwitcher /> <Link to="/signup">Sign up</Link> <Link to="/login">Login</Link>
            </>
        );
    }
}

function LanguageSwitcher() {
    const [lang, setLang] = useLang();
    const otherLang = lang === langA ? langB : langA;

    return <LinkButton onClick={() => setLang(otherLang)}>{otherLang}</LinkButton>;
}
