import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDocument } from '../../../../hooks/fetch';
import { useGuidelines } from '../../../../Manifesto/guidelines/guidelines';
import { MANIFESTO } from '../../../../routes';
import { DocReference, Term, Translation } from '../../../../types';
import Button, { ButtonContainer, ButtonLink } from '../../../Form/Button';
import CollapsableSection from '../../../Layout/CollapsableSection';
import { Columns } from '../../../Layout/Columns';
import MdxWrapper from '../../../MdxWrapper';
import { ModalDialog } from '../../../ModalDialog';
import { TermItem } from '../../../Terms/TermItem';
import { TermWithLang } from '../../../TermWithLang';
import { getLongestEntity, useTerms, useTranslations } from '../../service';
import s from './style.module.css';

type ModalProps = {
    termRefs: DocReference<Term>[];
    translationRefs: DocReference<Translation>[];
    title: React.ReactNode;
    onClose: () => void;
};

export default function PhraseModal({ title, termRefs, translationRefs, onClose }: ModalProps) {
    const { t } = useTranslation();
    const [widerModal, setWiderModal] = useState(false);

    return (
        <ModalDialog
            title={<span className={s.title}>{title}</span>}
            isDismissable
            onClose={onClose}
            width={widerModal ? 'wider' : 'medium'}
        >
            {!!termRefs.length && <ModalTerms termRefs={termRefs} title={title} setWiderModal={setWiderModal} />}
            {!!translationRefs.length && !termRefs.length && (
                <ModalTranslations translationRefs={translationRefs} setWiderModal={setWiderModal} />
            )}

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

const ModalTerms = ({
    termRefs,
    title,
    setWiderModal,
}: Pick<ModalProps, 'termRefs'> & { title: React.ReactNode; setWiderModal: (wide: boolean) => void }) => {
    const { t } = useTranslation();
    const getTerms = useTerms(termRefs);
    const terms = getTerms();
    const longestTerm = getLongestEntity(terms);
    const otherTerms = terms.filter(term => term.value !== longestTerm?.value);
    const TitleWrapped = () => <>{title}</>;

    useEffect(() => {
        setWiderModal(!!longestTerm?.guidelines.length);
    }, [longestTerm, setWiderModal]);

    return (
        <>
            {longestTerm && (
                <>
                    {!longestTerm.guidelines.length ? (
                        <TermItem term={longestTerm} />
                    ) : (
                        <Columns>
                            <div>
                                <h3 className={s.heading}>{t('textChecker.result.modal.headingTerms')}</h3>
                                <TermItem term={longestTerm} />
                            </div>
                            <Guidelines term={longestTerm} />
                        </Columns>
                    )}
                </>
            )}

            {!!otherTerms.length && (
                <div className={s.otherTerms}>
                    <h3>
                        <Trans t={t} i18nKey="textChecker.result.otherTerms" components={{ Term: <TitleWrapped /> }} />
                    </h3>
                    <div className={s.otherTermsList}>
                        {otherTerms.map(term => (
                            <TermItem key={term.id} term={term} size="small" />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

const Guidelines = ({ term }: { term: Term }) => {
    const { t } = useTranslation();
    const getGuidelines = useGuidelines(term.guidelines);
    const guidelines = getGuidelines();

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
                            components={{ Term: <TermWithLang term={term} /> }}
                        />
                    </p>
                    <ButtonContainer>
                        <ButtonLink primary to={MANIFESTO}>
                            {t('textChecker.result.modal.guidelineManifestoButton')}
                        </ButtonLink>
                    </ButtonContainer>
                </div>
            </div>
        </div>
    );
};

const ModalTranslations = ({
    translationRefs,
    setWiderModal,
}: Pick<ModalProps, 'translationRefs'> & { setWiderModal: (wide: boolean) => void }) => {
    const { t } = useTranslation();
    const getTranslations = useTranslations(translationRefs);
    const translations = getTranslations();

    useEffect(() => {
        setWiderModal(translationRefs.length > 1);
    }, [setWiderModal, translationRefs.length]);

    return (
        <div>
            <h3>{t('textChecker.result.termsHeading')}</h3>
            <div className={s.translationList}>
                {translations.map(translation => (
                    <ModalTranslationTerm key={translation.id} translation={translation} />
                ))}
            </div>
        </div>
    );
};

const ModalTranslationTerm = ({ translation }: { translation: Translation }) => {
    const getTerm = useDocument(translation.term);
    const term = getTerm();
    return <TermItem term={term} />;
};
