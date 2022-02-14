import { OverlayProvider } from '@react-aria/overlays';
import clsx from 'clsx';
import { Suspense, useEffect, useState } from 'react';
import { WrappedInLangColor } from '../../components/TermWithLang';
import {
    MatchGroup,
    useFilteredIndex,
    useIndexGrouped,
    useMatchGroups,
} from '../../components/TextChecker/TextCheckerResult/hooks';
import PhraseModal from '../../components/TextChecker/TextCheckerResult/Modal';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { collections } from '../../hooks/data';
import { GetList, useCollection, useDocuments } from '../../hooks/fetch';
import { Lang, Term, TermIndex, TextToken, TranslationIndex } from '../../types';
import { OnUpdate, TranslatorEnvironment } from '../types';
import { useAnalyzedText, useConvertEnv } from './hooks';
import styles from '../style.module.css';

type Props = {
    env: TranslatorEnvironment;
    onUpdate: OnUpdate;
};

type InnerProps = {
    lang: Lang;
    text: string;
    analyzedText: TextToken[];
    getHiddenTerms: GetList<Term>;
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
    onUpdate: OnUpdate;
};

export function Checker({ env, onUpdate }: Props) {
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
                <Loader text={checkerInput.text} lang={checkerInput.translatedLang} onUpdate={onUpdate} />;
            </Suspense>
        </OverlayProvider>
    );
}

function Loader({ lang, text, onUpdate }: { lang: Lang; text: string; onUpdate: OnUpdate }) {
    const getHiddenTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', true));
    const getTermIndex = useCollection(collections.termIndex);
    const getTranslationIndex = useCollection(collections.translationIndex);
    const [loadingAnalyzedText, analyzedText] = useAnalyzedText(lang, text);

    useEffect(() => {
        onUpdate({ status: loadingAnalyzedText ? 'loading' : 'idle' });
    }, [loadingAnalyzedText, onUpdate]);

    if (!analyzedText) {
        return null;
    }

    return (
        <Inner
            text={text}
            lang={lang}
            analyzedText={analyzedText}
            getHiddenTerms={getHiddenTerms}
            getTermIndex={getTermIndex}
            getTranslationIndex={getTranslationIndex}
            onUpdate={onUpdate}
        />
    );
}

function Inner({ lang, getTermIndex, getTranslationIndex, getHiddenTerms, text, analyzedText, onUpdate }: InnerProps) {
    const [showModal, setShowModal] = useState<number>();
    const termIndex = useIndexGrouped(useFilteredIndex(getTermIndex, getHiddenTerms, lang));
    const translationIndex = useIndexGrouped(useFilteredIndex(getTranslationIndex, getHiddenTerms, lang));
    const matchGroups = useMatchGroups(text, analyzedText, termIndex, translationIndex);
    const showModalMatch = showModal !== undefined && matchGroups.find(matchGroup => matchGroup.pos[0] === showModal);

    useEffect(() => {
        onUpdate({ status: 'idle', text, matches: matchGroups, lang }, setShowModal);
    }, [lang, matchGroups, onUpdate, text]);

    if (showModalMatch) {
        return (
            <ModalWrapper matchGroup={showModalMatch} text={text} onClose={() => setShowModal(undefined)} lang={lang} />
        );
    }

    return null;
}

function ModalWrapper({
    matchGroup,
    text,
    onClose,
    lang,
}: {
    matchGroup: MatchGroup;
    text: string;
    onClose: () => void;
    lang: Lang;
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
            />
        </Suspense>
    );
}
