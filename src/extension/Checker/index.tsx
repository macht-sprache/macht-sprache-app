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
import { OnUpdate, TranslatorEnvironment } from '../types';
import { CheckerInput, useAnalyzedText, useConvertEnv, usePersonTokens } from './hooks';

const EMPTY_ARRAY: never[] = [];

type Props = {
    env: TranslatorEnvironment;
    onUpdate: OnUpdate;
    showGenderModal: boolean;
    onCloseGenderModal: () => void;
};

type InnerProps = {
    analyzedText: TextToken[];
    analyzedOriginal: TextToken[];
    personTokens: PersonToken[];
    getHiddenTerms: GetList<Term>;
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
    onUpdate: OnUpdate;
} & CheckerInput;

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
            <Suspense fallback={null}>
                <Loader checkerInput={checkerInput} onUpdate={onUpdate} />;
            </Suspense>
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
    const [loadingAnalyzedText, analyzedText] = useAnalyzedText(translation.lang, translation.text);
    const [loadingAnalyzedOriginal, analyzedOriginal] = useAnalyzedText(original.lang, original.text);
    const [loadingPersons, personTokens] = usePersonTokens(original.lang, original.text);
    const loading = loadingAnalyzedText || loadingAnalyzedOriginal || loadingPersons;

    useEffect(() => {
        onUpdate({ status: loading ? 'loading' : 'idle' });
    }, [loading, onUpdate]);

    return (
        <Inner
            original={original}
            translation={translation}
            analyzedText={analyzedText ?? EMPTY_ARRAY}
            analyzedOriginal={analyzedOriginal ?? EMPTY_ARRAY}
            personTokens={personTokens ?? EMPTY_ARRAY}
            getHiddenTerms={getHiddenTerms}
            getTermIndex={getTermIndex}
            getTranslationIndex={getTranslationIndex}
            onUpdate={onUpdate}
        />
    );
}

function Inner({
    original,
    translation,
    getTermIndex,
    getTranslationIndex,
    getHiddenTerms,
    analyzedText,
    analyzedOriginal,
    personTokens,
    onUpdate,
}: InnerProps) {
    const [showModal, setShowModal] = useState<number>();
    const termIndex = useIndexGrouped(useFilteredIndex(getTermIndex, getHiddenTerms, translation.lang));
    const translationIndex = useIndexGrouped(useFilteredIndex(getTranslationIndex, getHiddenTerms, translation.lang));
    const matchGroups = useMatchGroups(translation.text, analyzedText, termIndex, translationIndex);

    const termIndexForOriginal = useIndexGrouped(useFilteredIndex(getTermIndex, getHiddenTerms, original.lang));
    const termMatchesForOriginal = useMatches(original.text, analyzedOriginal, termIndexForOriginal);

    const showModalMatch = showModal !== undefined && matchGroups.find(matchGroup => matchGroup.pos[0] === showModal);

    useEffect(() => {
        onUpdate(
            {
                status: 'idle',
                translation: { ...translation, tokens: matchGroups },
                original: { ...original, tokens: personTokens },
            },
            setShowModal
        );
    }, [matchGroups, onUpdate, original, personTokens, translation]);

    if (showModalMatch) {
        const translationsSortFn = (entity: Translation) => {
            const positionInText = (pos: [number, number], length: number) => (pos[0] + pos[1]) / 2 / length;
            const posInTranslation = positionInText(showModalMatch.pos, translation.text.length);
            return Math.min(
                ...termMatchesForOriginal
                    .filter(({ ref }) => ref.id === entity.term.id)
                    .map(({ pos }) => positionInText(pos, original.text.length))
                    .map(pos => posInTranslation - pos)
                    .map(Math.abs)
            );
        };

        return (
            <ModalWrapper
                matchGroup={showModalMatch}
                text={translation.text}
                onClose={() => setShowModal(undefined)}
                lang={translation.lang}
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
