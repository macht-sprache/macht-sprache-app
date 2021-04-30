const redactWord = (word: string) =>
    word.replace(/^(.)(.*)(.)$/, (m, p1, p2, p3) => p1 + Array(p2.length).fill('*').join('') + p3);

export const getRedact = (sensitiveTerms: Set<string>) => (term: string) =>
    term
        .split(/\b(\w+)\b/)
        .map(part => (sensitiveTerms.has(part.toLowerCase()) ? redactWord(part) : part))
        .join('');
