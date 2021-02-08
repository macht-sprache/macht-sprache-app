import { LanguageServiceClient } from '@google-cloud/language';
import { all, isNil, last, partition, slice, zip } from 'rambdax';
import { Lang } from '../../../src/types';
import { functions } from '../firebase';

const languageClient = new LanguageServiceClient();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const findTermMatches = async (term: string, snippet: string, language: Lang) => {
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

export const addTranslationExample = functions.https.onCall(async (data, context) => {
    if (!context.auth?.uid || !context.auth?.token.email_verified) {
        return;
    }
});
