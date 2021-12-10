import { uniq } from 'lodash/fp';
import { useMemo } from 'react';
import { GetList } from '../../../hooks/fetch';
import { DocReference, Index, Lang, Term, TermIndex, TextToken, Translation, TranslationIndex } from '../../../types';

type Match<T extends Term | Translation> = {
    pos: [number, number];
    ref: DocReference<T>;
};

type MatchGroup = {
    pos: [number, number];
    termMatches: Match<Term>[];
    translationMatches: Match<Translation>[];
};

type TextTokenWithOriginal = TextToken & {
    original: string;
};

export const useIndexGrouped = <T extends TermIndex | TranslationIndex>(getIndex: GetList<T>, lang: Lang) =>
    useMemo(() => {
        const termIndex = getIndex().filter(i => i.lang === lang);
        return termIndex.reduce<{ [firstLemma: string]: T[] }>((acc, cur) => {
            cur.lemmas.forEach(lemmaList => {
                const firstLemma = lemmaList[0]?.toLowerCase();
                if (firstLemma) {
                    if (acc[firstLemma]) {
                        acc[firstLemma].push(cur);
                    } else {
                        acc[firstLemma] = [cur];
                    }
                }
            });
            return acc;
        }, {});
    }, [getIndex, lang]);

const getCurrentMatches = <T extends Term | Translation>(
    textToken: TextTokenWithOriginal,
    indexGrouped: { [firstLemma: string]: Index<T>[] },
    analyzedText: TextTokenWithOriginal[],
    tokenIndex: number
) =>
    uniq([
        ...(indexGrouped[textToken.lemma.toLowerCase()] || []),
        ...(indexGrouped[textToken.original.toLowerCase()] || []),
    ]).reduce<Match<T>[]>((acc, cur) => {
        const matchedTerms = cur.lemmas.find(ll =>
            ll.every((lemma, lemmaIndex) => {
                const matchLemma = lemma.toLowerCase();
                const currentToken = analyzedText[tokenIndex + lemmaIndex];
                const textLemma = currentToken?.lemma?.toLowerCase();
                const textOriginal = currentToken?.original?.toLowerCase();
                return textLemma === matchLemma || textOriginal === matchLemma;
            })
        );
        if (matchedTerms) {
            acc.push({
                pos: [textToken.pos[0], analyzedText[tokenIndex + matchedTerms.length - 1].pos[1]],
                ref: cur.ref,
            });
        }
        return acc;
    }, []);

export const useMatchGroups = (
    text: string,
    analyzedText: TextToken[],
    termIndex: { [firstLemma: string]: TermIndex[] },
    translationIndex: { [firstLemma: string]: TranslationIndex[] }
) =>
    useMemo(() => {
        const analyzedTextWithOriginals = analyzedText.map(
            (textToken): TextTokenWithOriginal => ({
                ...textToken,
                original: text.substring(textToken.pos[0], textToken.pos[1]),
            })
        );
        return analyzedTextWithOriginals.reduce<MatchGroup[]>((groups, textToken, index) => {
            const termMatches = getCurrentMatches(textToken, termIndex, analyzedTextWithOriginals, index);
            const translationMatches = getCurrentMatches(textToken, translationIndex, analyzedTextWithOriginals, index);

            if (!termMatches.length && !translationMatches.length) {
                return groups;
            }

            const matchGroup: MatchGroup = {
                pos: [textToken.pos[0], Math.max(...[...termMatches, ...translationMatches].map(m => m.pos[1]))],
                termMatches,
                translationMatches,
            };

            const prevGroup = groups[groups.length - 1];

            if (prevGroup?.pos[1] >= matchGroup.pos[0]) {
                prevGroup.pos[1] = Math.max(prevGroup.pos[1], prevGroup.pos[1]);
                prevGroup.termMatches.push(...termMatches);
                prevGroup.translationMatches.push(...translationMatches);
            } else {
                groups.push(matchGroup);
            }

            return groups;
        }, []);
    }, [analyzedText, termIndex, text, translationIndex]);
