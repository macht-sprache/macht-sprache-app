import clsx from 'clsx';
import firebase from 'firebase/compat/app';
import Tooltip from 'rc-tooltip';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collections, getTranslationsRef } from '../../../hooks/data';
import { useCollection, useDocument } from '../../../hooks/fetch';
import { langA } from '../../../languages';
import { DocReference, Lang, Term, Translation } from '../../../types';
import { useLang } from '../../../useLang';
import DividedList from '../../DividedList';
import Button, { ButtonContainer } from '../../Form/Button';
import { ModalDialog } from '../../ModalDialog';
import { Redact } from '../../RedactSensitiveTerms';
import { TermItem } from '../../Terms/TermItem';
import { TermWithLang, WrappedInLangColor } from '../../TermWithLang';
import { sortTranslations } from '../../TranslationsList/service';
import s from './style.module.css';
import { Columns } from '../../Layout/Columns';
import { generatePath, Link } from 'react-router-dom';
import { TERM } from '../../../routes';

type BaseProps = {
    termRefs: DocReference<Term>[];
    translationRefs: DocReference<Translation>[];
};

type Props = BaseProps & {
    lang: Lang;
    onTooltipVisibleChange: (isVisible: boolean) => void;
};

type TooltipProps = BaseProps & {
    onClick: () => void;
};

type ModalProps = BaseProps & {
    title: React.ReactNode;
    onClose: () => void;
};

const useTerms = (termRefs: DocReference<Term>[]) =>
    useCollection(
        collections.terms.where(
            firebase.firestore.FieldPath.documentId(),
            'in',
            termRefs.map(ref => ref.id)
        )
    );

const useTranslations = (translationRefs: DocReference<Translation>[]) =>
    useCollection(
        collections.translations.where(
            firebase.firestore.FieldPath.documentId(),
            'in',
            translationRefs.map(ref => ref.id)
        )
    );

const useLangIdentifier = () => {
    const [lang] = useLang();
    return lang === langA ? 'langA' : 'langB';
};

const HighlightedPhrase: React.FC<Props> = ({ children, termRefs, translationRefs, lang, onTooltipVisibleChange }) => {
    const { t } = useTranslation();
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);

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
                        <PhraseTooltip
                            termRefs={termRefs}
                            translationRefs={translationRefs}
                            onClick={() => setOverlayOpen(true)}
                        />
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
                    onClick={() => {
                        setOverlayOpen(true);
                    }}
                    className={clsx(s.sensitiveWord, { [s.sensitiveWordHovered]: tooltipOpen })}
                    lang={lang}
                >
                    {children}
                </button>
            </Tooltip>
            {overlayOpen && (
                <Suspense fallback={null}>
                    <PhraseModal
                        title={<WrappedInLangColor lang={lang}>{children}</WrappedInLangColor>}
                        termRefs={termRefs}
                        translationRefs={translationRefs}
                        onClose={() => setOverlayOpen(false)}
                    />
                </Suspense>
            )}
        </>
    );
};

const PhraseTooltip = ({ termRefs, translationRefs, onClick }: TooltipProps) => {
    const { t } = useTranslation();

    return (
        <div className={s.tooltip} onClick={onClick}>
            {!!termRefs.length && <TooltipTerms termRefs={termRefs} />}
            {!!translationRefs.length && <TooltipTranslations translationRefs={translationRefs} />}
            <p>{t('textChecker.result.clickHint')}</p>
        </div>
    );
};

const TooltipTerms = ({ termRefs }: Pick<BaseProps, 'termRefs'>) => {
    const getTerms = useTerms(termRefs);
    const terms = getTerms();
    const longestTerm = getLongestEntity(terms);

    return <>{longestTerm && <TooltipTerm term={longestTerm} />}</>;
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
            {!!translations.length && (
                <p>
                    {t('textChecker.result.translationsHeading')}{' '}
                    <DividedList divider=", ">
                        {translations.map(translation => (
                            <Redact key={translation.id}>{translation.value}</Redact>
                        ))}
                    </DividedList>
                </p>
            )}
        </>
    );
};

const TooltipTranslations = ({ translationRefs }: Pick<BaseProps, 'translationRefs'>) => {
    const { t } = useTranslation();
    const getTranslations = useTranslations(translationRefs);
    const translations = getTranslations();

    return (
        <p>
            {t('textChecker.result.termsHeading')}{' '}
            <DividedList divider=", ">
                {translations.map(translation => (
                    <TooltipTranslationTerm key={translation.id} translation={translation} />
                ))}
            </DividedList>
        </p>
    );
};

const TooltipTranslationTerm = ({ translation }: { translation: Translation }) => {
    const getTerm = useDocument(translation.term);
    return <Redact>{getTerm().value}</Redact>;
};

const PhraseModal = ({ title, termRefs, translationRefs, onClose }: ModalProps) => {
    const { t } = useTranslation();
    return (
        <ModalDialog
            title={<span className={s.overlayTitle}>{title}</span>}
            isDismissable
            onClose={onClose}
            width="wide"
        >
            {!!termRefs.length && <ModalTerms termRefs={termRefs} />}
            {!!translationRefs.length && <ModalTranslations translationRefs={translationRefs} />}

            <ButtonContainer>
                <Button primary={true} onClick={onClose}>
                    {t('textChecker.result.modal.close')}
                </Button>
            </ButtonContainer>
        </ModalDialog>
    );
};

const ModalTerms = ({ termRefs }: Pick<BaseProps, 'termRefs'>) => {
    const getTerms = useTerms(termRefs);
    const terms = getTerms();

    return (
        <Columns>
            {terms.map(term => (
                <TermItem key={term.id} term={term} />
            ))}
        </Columns>
    );
};

const ModalTranslations = ({ translationRefs }: Pick<BaseProps, 'translationRefs'>) => {
    const { t } = useTranslation();
    const getTranslations = useTranslations(translationRefs);
    const translations = getTranslations();

    return (
        <div>
            <h3>{t('textChecker.result.termsHeading')}</h3>
            <ul className={s.overlayTranslationList}>
                {translations.map(translation => (
                    <ModalTranslationTerm key={translation.id} translation={translation} />
                ))}
            </ul>
        </div>
    );
};

const ModalTranslationTerm = ({ translation }: { translation: Translation }) => {
    const langIdentifier = useLangIdentifier();
    const getTerm = useDocument(translation.term);
    const term = getTerm();
    return (
        <li className={s.overlayTranslation}>
            <Link className={s.overlayTranslationTerm} to={generatePath(TERM, { termId: term.id })}>
                <TermWithLang term={term} />
            </Link>
            {term.definition[langIdentifier] && <>: </>}
            {term.definition[langIdentifier]}
        </li>
    );
};

const getLongestEntity = <Entity extends Term | Translation>(terms: Entity[]): Entity | null =>
    terms.reduce((prev, current) => (prev.value.length > current.value.length ? prev : current));

export default HighlightedPhrase;
