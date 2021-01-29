import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from '../authHooks';
import { auth } from '../firebase';
import LinkButton from '../LinkButton';

export function TopMenu() {
    const [user] = useAuthState();
    const logout = useCallback(() => {
        auth.signOut();
    }, []);

    if (user) {
        return (
            <>
                {user.displayName || user.email} <LinkButton onClick={logout}>Logout</LinkButton>
            </>
        );
    } else {
        return (
            <>
                <Link to="/signup">Sign up</Link> <Link to="/login">Login</Link>
            </>
        );
    }
}
