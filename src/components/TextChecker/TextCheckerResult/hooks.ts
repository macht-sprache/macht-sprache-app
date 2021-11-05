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
    textToken: TextToken,
    indexGrouped: { [firstLemma: string]: Index<T>[] },
    analyzedText: TextToken[],
    tokenIndex: number
) =>
    (indexGrouped[textToken.lemma.toLowerCase()] || []).reduce<Match<T>[]>((acc, cur) => {
        const matchedTerms = cur.lemmas.find(ll =>
            ll.every(
                (lemma, lemmaIndex) =>
                    analyzedText[tokenIndex + lemmaIndex]?.lemma.toLowerCase() === lemma.toLowerCase()
            )
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
    analyzedText: TextToken[],
    termIndex: { [firstLemma: string]: TermIndex[] },
    translationIndex: { [firstLemma: string]: TranslationIndex[] }
) =>
    useMemo(
        () =>
            analyzedText.reduce<MatchGroup[]>((groups, textToken, index) => {
                const termMatches = getCurrentMatches(textToken, termIndex, analyzedText, index);
                const translationMatches = getCurrentMatches(textToken, translationIndex, analyzedText, index);

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
            }, []),
        [analyzedText, termIndex, translationIndex]
    );
