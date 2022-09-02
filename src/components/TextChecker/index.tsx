import { useMatomo } from '@jonkoops/matomo-tracker-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { analyzeText } from '../../functions';
import { collections } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { useRequestState } from '../../hooks/useRequestState';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { TEXT_CHECKER, TEXT_CHECKER_RESULT } from '../../routes';
import { Lang, Term, TermIndex, TextToken, TranslationIndex } from '../../types';
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
    const getHiddenTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', true));
    const getTermIndex = useCollection(collections.termIndex);
    const getTranslationIndex = useCollection(collections.translationIndex);

    return (
        <Switch>
            <Route path={TEXT_CHECKER} exact>
                <EntryPage />
            </Route>
            <Route path={TEXT_CHECKER_RESULT} exact>
                <ResultPage
                    getTermIndex={getTermIndex}
                    getTranslationIndex={getTranslationIndex}
                    getHiddenTerms={getHiddenTerms}
                />
            </Route>
            <Route>
                <NotFoundPage />
            </Route>
        </Switch>
    );
}

function EntryPage() {
    const { trackEvent } = useMatomo();
    const history = useHistory<ResultPageState | EntryPageState>();
    const { state, pathname } = useLocation<EntryPageState>();
    const [requestState, setRequestState, error] = useRequestState();
    const errorLabel = useErrorLabel(error);
    const value = state || { text: '', lang: undefined, textType: undefined };

    return (
        <TextCheckerEntry
            busy={requestState === 'IN_PROGRESS'}
            value={value}
            error={errorLabel}
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
                        trackEvent({
                            category: 'text-checker',
                            action: 'check-text',
                            value: text.length,
                            customDimensions: [
                                {
                                    id: 1,
                                    value: lang,
                                },
                            ],
                        });
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
    getHiddenTerms,
}: {
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
    getHiddenTerms: GetList<Term>;
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
            getHiddenTerms={getHiddenTerms}
            lang={state.lang}
            text={state.text}
            analyzedText={state.analyzedText}
            onCancel={() => history.goBack()}
        />
    );
}

const useErrorLabel = (error: any) => {
    const { t } = useTranslation();

    if (!error) {
        return;
    }

    if (error.code === 'functions/resource-exhausted') {
        return t('common.error.tooManyRequests');
    }

    return t('common.error.general');
};
