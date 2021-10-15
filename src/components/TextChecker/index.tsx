import React from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { analyzeText } from '../../functions';
import { collections } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { useRequestState } from '../../hooks/useRequestState';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { TEXT_CHECKER, TEXT_CHECKER_RESULT } from '../../routes';
import { Lang, TermIndex, TextToken } from '../../types';
import TextCheckerEntry from './TextCheckerEntry';
import TextCheckerResult from './TextCheckerResult';

type ResultPageState =
    | {
          lang: Lang;
          text: string;
          analyzedText: TextToken[];
      }
    | undefined;

export default function TextChecker() {
    const getTermIndex = useCollection(collections.termIndex);

    return (
        <Switch>
            <Route path={TEXT_CHECKER} exact>
                <EntryPage />
            </Route>
            <Route path={TEXT_CHECKER_RESULT} exact>
                <ResultPage getTermIndex={getTermIndex} />
            </Route>
            <Route>
                <NotFoundPage />
            </Route>
        </Switch>
    );
}

function EntryPage() {
    const history = useHistory<ResultPageState>();
    const [requestState, setRequestState] = useRequestState();
    return (
        <TextCheckerEntry
            busy={requestState === 'IN_PROGRESS'}
            onSubmit={(text, lang) => {
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

function ResultPage({ getTermIndex }: { getTermIndex: GetList<TermIndex> }) {
    const history = useHistory();
    const { state } = useLocation<ResultPageState>();

    if (!state) {
        return <Redirect to={TEXT_CHECKER} />;
    }

    return (
        <TextCheckerResult
            getTermIndex={getTermIndex}
            lang={state.lang}
            text={state.text}
            analyzedText={state.analyzedText}
            onCancel={() => history.goBack()}
        />
    );
}
