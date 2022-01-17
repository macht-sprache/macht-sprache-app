import { useEffect, useState } from 'react';
import { useFilteredIndex, useIndexGrouped, useMatchGroups } from '../components/TextChecker/TextCheckerResult/hooks';
import { analyzeText } from '../functions';
import { collections } from '../hooks/data';
import { GetList, useCollection } from '../hooks/fetch';
import { langA, langB } from '../languages';
import { Lang, Term, TermIndex, TextToken, TranslationIndex } from '../types';
import { TranslatorEnvironment } from './types';

type InnerProps = {
    lang: Lang;
    text: string;
    analyzedText: TextToken[];
    getHiddenTerms: GetList<Term>;
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
};

const convertEnv = ({
    lang,
    originalLang,
    text,
}: TranslatorEnvironment): { translatedLang: Lang; text: string } | null => {
    const langs = [langA, langB];
    if (lang && langs.includes(lang) && originalLang && langs.includes(originalLang) && text) {
        return {
            translatedLang: lang as Lang,
            text: text,
        };
    }
    return null;
};

export function Checker(props: TranslatorEnvironment) {
    const checkerInput = convertEnv(props);

    if (!checkerInput) {
        return null;
    }

    return <Loader text={checkerInput.text} lang={checkerInput.translatedLang} />;
}

function Loader({ lang, text }: { lang: Lang; text: string }) {
    const getHiddenTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', true));
    const getTermIndex = useCollection(collections.termIndex);
    const getTranslationIndex = useCollection(collections.translationIndex);
    const [analyzedText, setAnalyzedText] = useState<TextToken[]>();

    useEffect(() => {
        analyzeText(text, lang).then(analyzedText => setAnalyzedText(analyzedText));
    }, [lang, text]);

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
        />
    );
}

function Inner({ lang, getTermIndex, getTranslationIndex, getHiddenTerms, text, analyzedText }: InnerProps) {
    const termIndex = useIndexGrouped(useFilteredIndex(getTermIndex, getHiddenTerms, lang));
    const translationIndex = useIndexGrouped(useFilteredIndex(getTranslationIndex, getHiddenTerms, lang));
    const matchGroups = useMatchGroups(text, analyzedText, termIndex, translationIndex);

    useEffect(() => {
        console.log(matchGroups);
    }, [matchGroups]);

    return null;
}
