import uniqBy from 'lodash/fp/uniqBy';
import xor from 'lodash/xor';
import { Trans, useTranslation } from 'react-i18next';
import { GetList, useDocuments } from '../../../../hooks/fetch';
import { Guideline, guidelineKeys, useGuidelines } from '../../../../Manifesto/guidelines/guidelines';
import { MANIFESTO } from '../../../../routes';
import { DocReference, Term, Translation } from '../../../../types';
import DividedList from '../../../DividedList';
import Button, { ButtonContainer } from '../../../Form/Button';
import CollapsableSection from '../../../Layout/CollapsableSection';
import { Columns } from '../../../Layout/Columns';
import Link from '../../../Link';
import MdxWrapper from '../../../MdxWrapper';
import { ModalDialog } from '../../../ModalDialog';
import { TermItem } from '../../../Terms/TermItem';
import { TermWithLang } from '../../../TermWithLang';
import { getLongestEntity, termOrTranslations } from '../../service';
import s from './style.module.css';

type ModalProps = {
    getTerms: GetList<Term>;
    getTranslations: GetList<Translation>;
    title: React.ReactNode;
    onClose: () => void;
};

export default function PhraseModal({ title, getTerms, getTranslations, onClose }: ModalProps) {
    const { t } = useTranslation();
    const terms = getTerms();
    const translations = getTranslations();
    const longestTerm = getLongestEntity(terms);
    const otherTerms = terms.filter(term => term.value !== longestTerm?.value);
    const termRefsForTranslations = uniqBy(
        termRef => termRef.id,
        translations.map(translation => translation.term)
    );
    const showTermOrTranslations = termOrTranslations(terms, translations);

    const widerModal =
        showTermOrTranslations === 'term' ? !!longestTerm?.guidelines.length : termRefsForTranslations.length > 1;

    return (
        <ModalDialog
            title={<span className={s.title}>{title}</span>}
            isDismissable
            onClose={onClose}
            width={widerModal ? 'wider' : 'medium'}
        >
            {showTermOrTranslations === 'term' ? (
                <ModalTerms longestTerm={longestTerm} otherTerms={otherTerms} title={title} />
            ) : (
                <ModalTranslations termRefsForTranslations={termRefsForTranslations} />
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
    longestTerm,
    otherTerms,
    title,
}: {
    longestTerm?: Term;
    otherTerms: Term[];
    title: React.ReactNode;
}) => {
    const { t } = useTranslation();
    const TitleWrapped = () => <>{title}</>;

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
                            <GuidelinesList term={longestTerm} />
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

const ModalTranslations = ({ termRefsForTranslations }: { termRefsForTranslations: DocReference<Term>[] }) => {
    const { t } = useTranslation();
    const getTerms = useDocuments(termRefsForTranslations);

    return (
        <div>
            <h3>{t('textChecker.result.termsHeading')}</h3>
            <div className={s.translationList}>
                {getTerms().map(term => (
                    <TermItem key={term.id} term={term} />
                ))}
            </div>
        </div>
    );
};
