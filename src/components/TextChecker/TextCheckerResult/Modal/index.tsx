import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { useDocument } from '../../../../hooks/fetch';
import { TERM } from '../../../../routes';
import { DocReference, Term, Translation } from '../../../../types';
import Button, { ButtonContainer } from '../../../Form/Button';
import { ModalDialog } from '../../../ModalDialog';
import { TermItem } from '../../../Terms/TermItem';
import { TermWithLang } from '../../../TermWithLang';
import { getLongestEntity, useLangIdentifier, useTerms, useTranslations } from '../../service';
import s from './style.module.css';

type ModalProps = {
    termRefs: DocReference<Term>[];
    translationRefs: DocReference<Translation>[];
    title: React.ReactNode;
    onClose: () => void;
};

export default function PhraseModal({ title, termRefs, translationRefs, onClose }: ModalProps) {
    const { t } = useTranslation();
    return (
        <ModalDialog title={<span className={s.title}>{title}</span>} isDismissable onClose={onClose} width="wide">
            {!!termRefs.length && <ModalTerms termRefs={termRefs} title={title} />}
            {!!translationRefs.length && <ModalTranslations translationRefs={translationRefs} />}

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

const ModalTerms = ({ termRefs, title }: Pick<ModalProps, 'termRefs'> & { title: React.ReactNode }) => {
    const { t } = useTranslation();
    const getTerms = useTerms(termRefs);
    const terms = getTerms();
    const longestTerm = getLongestEntity(terms);
    const otherTerms = terms.filter(term => term.value !== longestTerm?.value);
    const TitleWrapped = () => <>{title}</>;

    return (
        <>
            {longestTerm && <TermItem term={longestTerm} />}
            {otherTerms.length !== 0 && (
                <div className={s.otherTerms}>
                    <h3>
                        <Trans t={t} i18nKey="textChecker.result.otherTerms" components={{ Term: <TitleWrapped /> }} />
                    </h3>
                    {otherTerms.map(term => (
                        <TermItem key={term.id} term={term} size="small" />
                    ))}
                </div>
            )}
        </>
    );
};

const ModalTranslations = ({ translationRefs }: Pick<ModalProps, 'translationRefs'>) => {
    const { t } = useTranslation();
    const getTranslations = useTranslations(translationRefs);
    const translations = getTranslations();

    return (
        <div>
            <h3>{t('textChecker.result.termsHeading')}</h3>
            <ul className={s.translationList}>
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
        <li className={s.translation}>
            <Link className={s.translationTerm} to={generatePath(TERM, { termId: term.id })}>
                <TermWithLang term={term} />
            </Link>
            {term.definition[langIdentifier] && <>: </>}
            {term.definition[langIdentifier]}
        </li>
    );
};
