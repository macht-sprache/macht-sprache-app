import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../authHooks';
import { auth } from '../firebase';
import LinkButton from '../LinkButton';

export function TopMenu() {
    const user = useUser();
    const logout = useCallback(() => {
        auth.signOut();
    }, []);

    if (user) {
        return (
            <>
                {user.displayName} <LinkButton onClick={logout}>Logout</LinkButton>
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
