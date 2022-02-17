import { LanguageServiceClient } from '@google-cloud/language';
import { all, isNil, last, partition, slice, zip } from 'rambdax';
import { Lang, PersonToken, TextToken } from '../../../src/types';

const languageClient = new LanguageServiceClient();

export const findTermMatches = async (term: string, snippet: string, language: Lang) => {
    const content = term + '\n\n' + snippet;

    const [{ tokens }] = await languageClient.analyzeSyntax({
        document: {
            type: 'PLAIN_TEXT',
            content,
            language,
        },
        encodingType: 'UTF16',
    });

    if (!tokens) {
        return [];
    }

    const [termTokens, snippetTokens] = partition(({ text }) => {
        const beginOffset = text?.beginOffset;
        return !isNil(beginOffset) && beginOffset <= term.length;
    }, tokens);

    const termMatches = snippetTokens.reduce<string[]>((prev, cur, index) => {
        const snippetTokensToMatch = snippetTokens.slice(index, index + termTokens.length);
        const tokenPairs = zip(termTokens, snippetTokensToMatch);
        if (
            tokenPairs.length === termTokens.length &&
            all(
                ([termToken, snippetToken]) => termToken.lemma?.toLowerCase() === snippetToken.lemma?.toLowerCase(),
                tokenPairs
            )
        ) {
            const startIndex = cur.text?.beginOffset;
            const lastToken = last(snippetTokensToMatch);
            const endIndex = (lastToken.text?.beginOffset || 0) + (lastToken.text?.content?.length || 0);

            if (typeof startIndex === 'number') {
                prev.push(slice(startIndex, endIndex, content));
            }
        }
        return prev;
    }, []);

    return termMatches;
};

// const excludedTags: (keyof typeof protos.google.cloud.language.v1.PartOfSpeech.Tag)[] = ['PUNCT'];

export const findLemmas = async (content: string, language: Lang): Promise<TextToken[]> => {
    const [{ tokens }] = await languageClient.analyzeSyntax({
        document: {
            type: 'PLAIN_TEXT',
            content,
            language,
        },
        encodingType: 'UTF16',
    });

    return (tokens || []).map(token => ({
        lemma: token.lemma!,
        pos: [token.text!.beginOffset!, token.text!.beginOffset! + token.text!.content!.length],
    }));
};

export const findPersons = async (content: string, language: Lang): Promise<PersonToken[]> => {
    const [result] = await languageClient.analyzeEntities({
        document: {
            type: 'PLAIN_TEXT',
            content,
            language,
        },
        encodingType: 'UTF16',
    });

    const { entities } = result;

    return (entities || [])
        .filter(entity => entity.type === 'PERSON' && !entity.metadata?.mid)
        .filter(entity => !entity.mentions?.every(mention => mention.type === 'PROPER'))
        .flatMap(
            (entity): PersonToken[] =>
                entity.mentions?.map(({ text }) => ({
                    pos: [text!.beginOffset!, text!.beginOffset! + text!.content!.length],
                })) || []
        )
        .sort((a, b) => a.pos[0] - b.pos[0]);
};
