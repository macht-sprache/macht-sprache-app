import { useEnsureUserEntity } from './hooks/auth';

export function useLaunched() {
    const user = useEnsureUserEntity();

    return !!user || process.env.REACT_APP_LAUNCHED === 'true';
}
