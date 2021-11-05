import React from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { analyzeText } from '../../functions';
import { collections } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { useRequestState } from '../../hooks/useRequestState';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { TEXT_CHECKER, TEXT_CHECKER_RESULT } from '../../routes';
import { Lang, TermIndex, TextToken, TranslationIndex } from '../../types';
import TextCheckerEntry, { TextCheckerValue } from './TextCheckerEntry';
import TextCheckerResult from './TextCheckerResult';

type EntryPageState = TextCheckerValue | undefined;

type ResultPageState =
    | {
          lang: Lang;
          text: string;
          analyzedText: TextToken[];
      }
    | undefined;

export default function TextChecker() {
    const getTermIndex = useCollection(collections.termIndex);
    const getTranslationIndex = useCollection(collections.translationIndex);

    return (
        <Switch>
            <Route path={TEXT_CHECKER} exact>
                <EntryPage />
            </Route>
            <Route path={TEXT_CHECKER_RESULT} exact>
                <ResultPage getTermIndex={getTermIndex} getTranslationIndex={getTranslationIndex} />
            </Route>
            <Route>
                <NotFoundPage />
            </Route>
        </Switch>
    );
}

function EntryPage() {
    const history = useHistory<ResultPageState | EntryPageState>();
    const { state, pathname } = useLocation<EntryPageState>();
    const [requestState, setRequestState] = useRequestState();
    const value = state || { text: '', lang: undefined, textType: undefined };
    return (
        <TextCheckerEntry
            busy={requestState === 'IN_PROGRESS'}
            value={value}
            onChange={newValue => history.replace(pathname, newValue)}
            onSubmit={() => {
                const { lang, text } = value;
                if (!lang || !text) {
                    return;
                }
                setRequestState('IN_PROGRESS');
                analyzeText(text, lang).then(
                    analyzedText => {
                        setRequestState('DONE');
                        history.push(TEXT_CHECKER_RESULT, { lang, text, analyzedText });
                    },
                    error => setRequestState('ERROR', error)
                );
            }}
        />
    );
}

function ResultPage({
    getTermIndex,
    getTranslationIndex,
}: {
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
}) {
    const history = useHistory();
    const { state } = useLocation<ResultPageState>();

    if (!state) {
        return <Redirect to={TEXT_CHECKER} />;
    }

    return (
        <TextCheckerResult
            getTermIndex={getTermIndex}
            getTranslationIndex={getTranslationIndex}
            lang={state.lang}
            text={state.text}
            analyzedText={state.analyzedText}
            onCancel={() => history.goBack()}
        />
    );
}
