import uniqBy from 'lodash/uniqBy';
import xor from 'lodash/xor';
import React, { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { GetList, useDocuments } from '../../../../hooks/fetch';
import { Guideline, guidelineKeys, useGuidelines } from '../../../../Manifesto/guidelines/guidelines';
import { MANIFESTO } from '../../../../routes';
import { Term, Translation } from '../../../../types';
import DividedList from '../../../DividedList';
import Button, { ButtonContainer } from '../../../Form/Button';
import CollapsableSection from '../../../Layout/CollapsableSection';
import { Columns } from '../../../Layout/Columns';
import Link from '../../../Link';
import MdxWrapper from '../../../MdxWrapper';
import { ModalDialog } from '../../../ModalDialog';
import { TermItem } from '../../../Terms/TermItem';
import { TermWithLang } from '../../../TermWithLang';
import { sortEntities, termOrTranslations } from '../../service';
import s from './style.module.css';

type ModalProps = {
    getTerms: GetList<Term>;
    getTranslations: GetList<Translation>;
    title: React.ReactNode;
    onClose: () => void;
    containerClassName?: string;
    translationsSortFn?: (translation: Translation) => number;
    showLogo?: boolean;
};

type InnerProps = {
    title: React.ReactNode;
    topMatch: {
        term: Term;
        source: 'term' | 'translation';
    };
    otherMatches: Term[];
};

export default function PhraseModal({
    title,
    getTerms,
    getTranslations,
    onClose,
    containerClassName,
    translationsSortFn,
    showLogo,
}: ModalProps) {
    const { t } = useTranslation();
    const terms = sortEntities(getTerms());
    const translations = sortEntities(getTranslations(), translationsSortFn);
    const termRefsForTranslations = uniqBy(
        translations.map(translation => translation.term),
        termRef => termRef.id
    );
    const getTranslationTerms = useDocuments(termRefsForTranslations);
    const translationTerms = getTranslationTerms();

    const showTermOrTranslations = termOrTranslations(terms, translations);
    const topMatch: Term | undefined = (showTermOrTranslations === 'term' ? terms : translationTerms)[0];

    if (!topMatch) {
        return null;
    }

    const otherMatches = [...terms, ...translationTerms].filter(term => term.id !== topMatch.id);

    return (
        <ModalDialog
            title={<span className={s.title}>{title}</span>}
            isDismissable
            onClose={onClose}
            width={!!topMatch.guidelines.length ? 'wider' : 'medium'}
            containerClassName={containerClassName}
            showLogo={showLogo}
        >
            <ModalInner
                topMatch={{ term: topMatch, source: showTermOrTranslations }}
                otherMatches={otherMatches}
                title={title}
            />

            <div className={s.buttonContainer}>
                <ButtonContainer>
                    <Button primary={true} onClick={onClose}>
                        {t('textChecker.result.modal.close')}
                    </Button>
                </ButtonContainer>
            </div>
        </ModalDialog>
    );
}

const ModalInner = ({ topMatch, otherMatches, title }: InnerProps) => {
    const { t } = useTranslation();
    const TitleWrapped = useCallback(() => <>{title}</>, [title]);
    const topMatchHeading = {
        term: t('textChecker.result.modal.headingTerms'),
        translation: t('textChecker.result.termsHeading'),
    }[topMatch.source];

    return (
        <>
            {!topMatch.term.guidelines.length ? (
                <TermItem term={topMatch.term} />
            ) : (
                <Columns>
                    <div>
                        <h3 className={s.heading}>{topMatchHeading}</h3>
                        <TermItem term={topMatch.term} />
                    </div>
                    <GuidelinesList term={topMatch.term} />
                </Columns>
            )}

            <OtherTermList
                terms={otherMatches}
                title={<Trans t={t} i18nKey="textChecker.result.otherTerms" components={{ Term: <TitleWrapped /> }} />}
            />
        </>
    );
};

const OtherTermList = ({ terms, title }: { terms: Term[]; title: React.ReactNode }) => {
    if (!terms.length) {
        return null;
    }

    return (
        <div className={s.otherTerms}>
            <h3>{title}</h3>
            <div className={s.otherTermsList}>
                {terms.map(term => (
                    <TermItem key={term.id} term={term} size="small" />
                ))}
            </div>
        </div>
    );
};

const GuidelinesList = ({ term }: { term: Term }) => {
    const getGuidelines = useGuidelines(term.guidelines);
    const guidelines = getGuidelines();
    const getOtherGuidelines = useGuidelines(xor(guidelineKeys, term.guidelines));
    const otherGuidelines = getOtherGuidelines();

    return (
        <div>
            <h3 className={s.heading}>
                <Trans
                    i18nKey="textChecker.result.modal.headingGuidelines"
                    components={{ ManifestoLink: <Link to={MANIFESTO} /> }}
                />
            </h3>
            <div className={s.guidelines}>
                <MdxWrapper>
                    {guidelines.map(guideline => (
                        <CollapsableSection
                            key={guideline.id}
                            title={guideline.title}
                            intro={guideline.intro}
                            domId={guideline.id}
                        >
                            <guideline.Content />
                        </CollapsableSection>
                    ))}
                </MdxWrapper>
                <div className={s.manifestoLinkBox}>
                    <p className={s.manifestoLinkText}>
                        <Trans
                            i18nKey="textChecker.result.modal.guidelineManifestoText"
                            components={{
                                Term: <TermWithLang term={term} />,
                                OtherGuidelines: <OtherGuidelines guidelines={otherGuidelines} />,
                            }}
                        />
                    </p>
                </div>
            </div>
        </div>
    );
};

const OtherGuidelines = ({ guidelines }: { guidelines: Guideline[] }) => {
    const { t } = useTranslation();

    return (
        <DividedList divider=", " lastDivider={` ${t('common.and')} `}>
            {guidelines.map(({ id, title }) => (
                <Link to={`${MANIFESTO}#${id}`} key={id}>
                    {title}
                </Link>
            ))}
        </DividedList>
    );
};
