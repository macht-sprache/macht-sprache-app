import { OverlayProvider } from '@react-aria/overlays';
import clsx from 'clsx';
import { Suspense, useEffect, useState } from 'react';
import { WrappedInLangColor } from '../../components/TermWithLang';
import {
    MatchGroup,
    useFilteredIndex,
    useIndexGrouped,
    useMatches,
    useMatchGroups,
} from '../../components/TextChecker/TextCheckerResult/hooks';
import PhraseModal from '../../components/TextChecker/TextCheckerResult/Modal';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { collections } from '../../hooks/data';
import { GetList, useCollection, useDocuments } from '../../hooks/fetch';
import { Lang, PersonToken, Term, TermIndex, TextToken, Translation, TranslationIndex } from '../../types';
import { GenderOverlay } from '../GenderOverlay';
import styles from '../style.module.css';
import { OnUpdate, Status, TranslatorEnvironment } from '../types';
import { AnalyzeResult, CheckerInput, useConvertEnv, usePersonTokens, useTextTokens } from './hooks';

type Props = {
    env: TranslatorEnvironment;
    onUpdate: OnUpdate;
    showGenderModal: boolean;
    onCloseGenderModal: () => void;
};

type InnerProps = {
    translationResult: AnalyzeResult<TextToken[]>;
    originalResult: AnalyzeResult<TextToken[]>;
    personResult: AnalyzeResult<PersonToken[]>;
    getHiddenTerms: GetList<Term>;
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
    status: Status;
    onUpdate: OnUpdate;
};

export function Checker({ env, onUpdate, showGenderModal, onCloseGenderModal }: Props) {
    const checkerInput = useConvertEnv(env);

    useEffect(() => {
        if (!checkerInput) {
            onUpdate({ status: 'inactive' });
        }
    }, [checkerInput, onUpdate]);

    if (!checkerInput) {
        return null;
    }

    return (
        <OverlayProvider>
            <Loader checkerInput={checkerInput} onUpdate={onUpdate} />
            <GenderOverlay isOpen={showGenderModal} onClose={onCloseGenderModal} />
        </OverlayProvider>
    );
}

function Loader({
    checkerInput: { original, translation },
    onUpdate,
}: {
    checkerInput: CheckerInput;
    onUpdate: OnUpdate;
}) {
    const getHiddenTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', true));
    const getTermIndex = useCollection(collections.termIndex);
    const getTranslationIndex = useCollection(collections.translationIndex);
    const [loadingTranslationResult, translationResult] = useTextTokens(translation.lang, translation.text);
    const [loadingOriginalResult, originalResult] = useTextTokens(original.lang, original.text);
    const [loadingPersonResult, personResult] = usePersonTokens(original.lang, original.text);
    const loading = loadingTranslationResult || loadingOriginalResult || loadingPersonResult;

    useEffect(() => {
        if (loading) {
            onUpdate({ status: 'loading' });
        }
    }, [loading, onUpdate]);

    return (
        <Suspense fallback={null}>
            <Inner
                translationResult={translationResult ?? { ...translation, tokens: [] }}
                originalResult={originalResult ?? { ...original, tokens: [] }}
                personResult={personResult ?? { ...original, tokens: [] }}
                getHiddenTerms={getHiddenTerms}
                getTermIndex={getTermIndex}
                getTranslationIndex={getTranslationIndex}
                status={loading ? 'loading' : 'idle'}
                onUpdate={onUpdate}
            />
        </Suspense>
    );
}

function Inner({
    getTermIndex,
    getTranslationIndex,
    getHiddenTerms,
    translationResult,
    originalResult,
    personResult,
    status,
    onUpdate,
}: InnerProps) {
    const [showModal, setShowModal] = useState<number>();
    const termIndex = useIndexGrouped(useFilteredIndex(getTermIndex, getHiddenTerms, translationResult.lang));
    const translationIndex = useIndexGrouped(
        useFilteredIndex(getTranslationIndex, getHiddenTerms, translationResult.lang)
    );
    const matchGroups = useMatchGroups(translationResult.text, translationResult.tokens, termIndex, translationIndex);

    const termIndexForOriginal = useIndexGrouped(useFilteredIndex(getTermIndex, getHiddenTerms, originalResult.lang));
    const termMatchesForOriginal = useMatches(originalResult.text, originalResult.tokens, termIndexForOriginal);

    const showModalMatch = showModal !== undefined && matchGroups.find(matchGroup => matchGroup.pos[0] === showModal);

    useEffect(() => {
        onUpdate(
            {
                status,
                translation: { ...translationResult, tokens: matchGroups },
                original: personResult,
            },
            setShowModal
        );
    }, [matchGroups, onUpdate, personResult, status, translationResult]);

    if (showModalMatch) {
        const translationsSortFn = (entity: Translation) => {
            const positionInText = (pos: [number, number], length: number) => (pos[0] + pos[1]) / 2 / length;
            const posInTranslation = positionInText(showModalMatch.pos, translationResult.text.length);
            return Math.min(
                ...termMatchesForOriginal
                    .filter(({ ref }) => ref.id === entity.term.id)
                    .map(({ pos }) => positionInText(pos, originalResult.text.length))
                    .map(pos => posInTranslation - pos)
                    .map(Math.abs)
            );
        };

        return (
            <ModalWrapper
                matchGroup={showModalMatch}
                text={translationResult.text}
                onClose={() => setShowModal(undefined)}
                lang={translationResult.lang}
                translationsSortFn={translationsSortFn}
            />
        );
    }

    return null;
}

function ModalWrapper({
    matchGroup,
    text,
    onClose,
    lang,
    translationsSortFn,
}: {
    matchGroup: MatchGroup;
    text: string;
    onClose: () => void;
    lang: Lang;
    translationsSortFn: (entity: Translation) => number;
}) {
    const getTerms = useDocuments(matchGroup.termMatches.map(match => match.ref));
    const getTranslations = useDocuments(matchGroup.translationMatches.map(match => match.ref));
    const [start, end] = matchGroup.pos;

    return (
        <Suspense fallback={null}>
            <PhraseModal
                title={<WrappedInLangColor lang={lang}>{text.substring(start, end)}</WrappedInLangColor>}
                getTerms={getTerms}
                getTranslations={getTranslations}
                onClose={onClose}
                containerClassName={clsx(CSS_CONTEXT_CLASS_NAME, styles.globalStyle)}
                translationsSortFn={translationsSortFn}
                showLogo
            />
        </Suspense>
    );
}
