import { useMemo } from 'react';
import { useSensitiveTerms } from '../hooks/appContext';

const redactWord = (word: string) =>
    word.replace(/^(.)(.*)(.)$/, (m, p1, p2, p3) => p1 + Array(p2.length).fill('*').join('') + p3);

export const useRedacted = (term: string) => {
    const sensitiveTerms = useSensitiveTerms();
    return useMemo(
        () =>
            term
                .split(/\b(\w+)\b/)
                .map(part => (sensitiveTerms.has(part.toLowerCase()) ? redactWord(part) : part))
                .join(''),
        [sensitiveTerms, term]
    );
};

export function Redact({ children }: { children: string }) {
    const redacted = useRedacted(children);
    return <>{redacted}</>;
}
