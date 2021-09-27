import { useMemo } from 'react';
import { useAppContext } from '../../hooks/appContext';
import { getRedact } from './service';

export const useRedacted = (term: string, alwaysRedact?: boolean) => {
    const { sensitiveTerms, userSettings } = useAppContext();
    const showRedacted = !alwaysRedact && !!userSettings?.showRedacted;
    const redact = useMemo(() => getRedact(sensitiveTerms), [sensitiveTerms]);
    return useMemo(() => (showRedacted ? term : redact(term)), [redact, term, showRedacted]);
};

export function Redact({ children }: { children: string }) {
    const redacted = useRedacted(children);
    return <>{redacted}</>;
}
