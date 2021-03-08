import { useUser } from './hooks/appContext';

export function useLaunched() {
    const user = useUser();

    return !!user || process.env.REACT_APP_LAUNCHED === 'true';
}
