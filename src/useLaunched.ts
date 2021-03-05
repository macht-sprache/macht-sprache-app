import { useUser } from './hooks/auth';

export function useLaunched() {
    const user = useUser();

    return !!user || process.env.REACT_APP_LAUNCHED === 'true';
}
