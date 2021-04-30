import { useMemo } from 'react';
import { useAppContext } from '../hooks/appContext';
import { getRedact } from './service';

export const useRedacted = (term: string) => {
    const { sensitiveTerms, userSettings } = useAppContext();
    const redact = useMemo(() => getRedact(sensitiveTerms), [sensitiveTerms]);
    return useMemo(() => (userSettings?.showRedacted ? term : redact(term)), [
        redact,
        term,
        userSettings?.showRedacted,
    ]);
};

export function Redact({ children }: { children: string }) {
    const redacted = useRedacted(children);
    return <>{redacted}</>;
}
