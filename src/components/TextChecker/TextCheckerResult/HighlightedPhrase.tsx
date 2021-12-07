import clsx from 'clsx';
import uniqBy from 'lodash/fp/uniqBy';
import Tooltip from 'rc-tooltip';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collections, getTranslationsRef } from '../../../hooks/data';
import { GetList, useCollection, useDocuments } from '../../../hooks/fetch';
import { DocReference, Lang, Term, Translation } from '../../../types';
import DividedList from '../../DividedList';
import { Redact } from '../../RedactSensitiveTerms';
import { WrappedInLangColor } from '../../TermWithLang';
import { sortTranslations } from '../../TranslationsList/service';
import { getLongestEntity, termOrTranslations, useLangIdentifier } from '../service';
import PhraseModal from './Modal';
import s from './style.module.css';

type Props = {
    termRefs: DocReference<Term>[];
    translationRefs: DocReference<Translation>[];
    lang: Lang;
    showModal: boolean;
    openModal: () => void;
    closeModal: () => void;
    onTooltipVisibleChange: (isVisible: boolean) => void;
};

type InnerProps = {
    getTerms: GetList<Term>;
    getTranslations: GetList<Translation>;
};

type TooltipProps = InnerProps & {
    onClick: () => void;
};

const HighlightedPhrase: React.FC<Props> = ({
    children,
    termRefs,
    translationRefs,
    lang,
    showModal,
    openModal,
    closeModal,
    onTooltipVisibleChange,
}) => {
    const { t } = useTranslation();
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const getTerms = useDocuments(termRefs);
    const getTranslations = useDocuments(translationRefs);

    return (
        <>
            <Tooltip
                overlay={
                    <Suspense
                        fallback={
                            <>
                                {/* TODO: nicer loading state */}
                                {t('common.loading')}
                            </>
                        }
                    >
                        <PhraseTooltip getTerms={getTerms} getTranslations={getTranslations} onClick={openModal} />
                    </Suspense>
                }
                placement="bottom"
                onVisibleChange={visible => {
                    setTooltipOpen(visible);
                    onTooltipVisibleChange(visible);
                }}
                mouseEnterDelay={0.2}
                mouseLeaveDelay={0.2}
            >
                <button
                    onClick={openModal}
                    className={clsx(s.sensitiveWord, { [s.sensitiveWordHovered]: tooltipOpen })}
                    lang={lang}
                >
                    {children}
                </button>
            </Tooltip>
            {showModal && (
                <Suspense fallback={null}>
                    <PhraseModal
                        title={<WrappedInLangColor lang={lang}>{children}</WrappedInLangColor>}
                        getTerms={getTerms}
                        getTranslations={getTranslations}
                        onClose={closeModal}
                    />
                </Suspense>
            )}
        </>
    );
};

const PhraseTooltip = ({ getTerms, getTranslations, onClick }: TooltipProps) => {
    const terms = getTerms();
    const translations = getTranslations();
    return (
        <div className={s.tooltip} onClick={onClick}>
            {termOrTranslations(terms, translations) === 'term' ? (
                <TooltipTerms terms={terms} />
            ) : (
                <TooltipTranslations translations={translations} />
            )}
        </div>
    );
};

const TooltipTerms = ({ terms }: { terms: Term[] }) => {
    const longestTerm = getLongestEntity(terms);
    return longestTerm ? <TooltipTerm term={longestTerm} /> : null;
};

const TooltipTerm = ({ term }: { term: Term }) => {
    const { t } = useTranslation();
    const langIdentifier = useLangIdentifier();
    const getTranslations = useCollection(getTranslationsRef(collections.terms.doc(term.id)));
    const translations = sortTranslations(getTranslations());
    const termDefinition = term.definition[langIdentifier];

    return (
        <>
            {termDefinition && <p className={s.tooltipDefinition}>{termDefinition}</p>}
            {!!translations.length ? (
                <p>
                    <strong>{t('textChecker.result.translationsHeading')}</strong>{' '}
                    <DividedList divider=", ">
                        {translations.map(translation => (
                            <Redact key={translation.id}>{translation.value}</Redact>
                        ))}
                    </DividedList>
                </p>
            ) : (
                <p>{t('translation.emptyShort')}</p>
            )}
        </>
    );
};

const TooltipTranslations = ({ translations }: { translations: Translation[] }) => {
    const { t } = useTranslation();
    const termRefs = uniqBy(
        termRef => termRef.id,
        translations.map(translation => translation.term)
    );
    const getTerms = useDocuments(termRefs);

    return (
        <p>
            <strong>{t('textChecker.result.translationsHeading')}</strong>{' '}
            <DividedList divider=", ">
                {getTerms().map(term => (
                    <Redact key={term.id}>{term.value}</Redact>
                ))}
            </DividedList>
        </p>
    );
};

export default HighlightedPhrase;
