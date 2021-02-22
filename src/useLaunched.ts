import { useEffect, useState } from 'react';
import { useEnsureUserEntity } from './hooks/auth';

export function useLaunched() {
    const user = useEnsureUserEntity();
    const [loggedInOrLaunched, setLoggedInOrLaunched] = useState(!!user || process.env.REACT_APP_LAUNCHED === 'true');

    useEffect(() => {
        setLoggedInOrLaunched(!!user || process.env.REACT_APP_LAUNCHED === 'true');
    }, [user]);

    return [loggedInOrLaunched];
}
