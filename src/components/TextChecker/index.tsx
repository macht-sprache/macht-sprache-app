import { useState } from 'react';
import { analyzeText } from '../../functions';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { useRequestState } from '../../hooks/useRequestState';
import { Lang, TextToken } from '../../types';
import TextCheckerEntry from './TextCheckerEntry';
import TextCheckerResult from './TextCheckerResult';

export default function TextChecker() {
    const getTermIndex = useCollection(collections.termIndex);
    const [requestState, setRequestState] = useRequestState();
    const [result, setResult] = useState<{ lang: Lang; text: string; analyzedText: TextToken[] } | undefined>();

    return (
        <>
            {result ? (
                <TextCheckerResult
                    getTermIndex={getTermIndex}
                    lang={result.lang}
                    text={result.text}
                    analyzedText={result.analyzedText}
                    onCancel={() => {
                        setRequestState('INIT');
                        setResult(undefined);
                    }}
                />
            ) : (
                <TextCheckerEntry
                    busy={requestState === 'IN_PROGRESS'}
                    onSubmit={(text, lang) => {
                        setRequestState('IN_PROGRESS');
                        analyzeText(text, lang).then(
                            analyzedText => {
                                setRequestState('DONE');
                                setResult({ lang, text, analyzedText });
                            },
                            error => setRequestState('ERROR', error)
                        );
                    }}
                />
            )}
        </>
    );
}
