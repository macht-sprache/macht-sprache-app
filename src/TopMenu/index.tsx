import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from '../authHooks';
import { auth } from '../firebase';

export function TopMenu() {
    const [user] = useAuthState();
    const logout = useCallback(() => {
        auth.signOut();
    }, []);

    if (user) {
        return (
            <>
                {user.displayName || user.email}{' '}
                <a href="#" onClick={logout}>
                    Logout
                </a>
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
