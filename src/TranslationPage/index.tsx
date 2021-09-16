import clsx from 'clsx';
import { Suspense, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import Comments from '../Comments';
import ConfirmModal from '../ConfirmModal';
import Button, { ButtonContainer } from '../Form/Button';
import { Input, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { useAppContext } from '../hooks/appContext';
import { collections, getSourcesRef, getTranslationExamplesRef } from '../hooks/data';
import { Get, GetList, useCollection, useDocument } from '../hooks/fetch';
import { langA, langB } from '../languages';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import PageTitle from '../PageTitle';
import { RatingContainer } from '../Rating';
import { Redact } from '../RedactSensitiveTerms';
import { TERM } from '../routes';
import Share from '../Share';
import SidebarTermRedirectWrapper from '../SidebarTermRedirectWrapper';
import { TermWithLang } from '../TermWithLang';
import TranslationExamplesList from '../TranslationExamplesList';
import { Source, Term, Translation, TranslationExample } from '../types';
import { getDominantLanguageClass } from '../useLangCssVars';
import { UserInlineDisplay } from '../UserInlineDisplay';
import s from './style.module.css';

type Props = {
    getTerm: Get<Term>;
    getTranslation: Get<Translation>;
    getTranslationExamples: GetList<TranslationExample>;
    getSources: GetList<Source>;
};

export default function TranslationPageWrapper() {
    const { termId, translationId } = useParams<{
        termId: string;
        translationId: string;
    }>();
    const translationRef = collections.translations.doc(translationId);
    const getTerm = useDocument(collections.terms.doc(termId));
    const getTranslation = useDocument(translationRef);
    const getTranslationExamples = useCollection(getTranslationExamplesRef(translationRef));
    const getSources = useCollection(getSourcesRef(translationRef));
    const props = { getTerm, getTranslation, getTranslationExamples, getSources };
    return (
        <SidebarTermRedirectWrapper getTerm={getTerm}>
            <TranslationPage {...props} />
        </SidebarTermRedirectWrapper>
    );
}

function TranslationPage({ getTerm, getTranslation, getTranslationExamples, getSources }: Props) {
    const { user, userProperties } = useAppContext();
    const { t } = useTranslation();
    const term = getTerm();
    const translation = getTranslation();
    const canEdit = translation.creator.id === user?.id || userProperties?.admin;
    const canDelete = userProperties?.admin;

    return (
        <>
            <PageTitle title={translation.value} lang={translation.lang} />
            <Header
                capitalize
                mainLang={translation.lang}
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: <Redact>{term.value}</Redact>,
                        lang: term.lang,
                    },
                ]}
                subLine={
                    <>
                        <Trans
                            t={t}
                            i18nKey="common.addedOn"
                            components={{
                                User: <UserInlineDisplay {...translation.creator} />,
                                FormatDate: <FormatDate date={translation.createdAt} />,
                            }}
                        />
                        {canEdit && (
                            <>
                                {' | '}
                                <EditTranslation translation={translation} />
                            </>
                        )}
                        {canDelete && (
                            <>
                                {' | '}
                                <DeleteTranslation translation={translation} />
                            </>
                        )}
                        <Share
                            itemTranslated={t('common.entities.translation.value')}
                            title={`macht.sprache.: ${translation.value}`}
                            text={t('translation.share', { term: term.value, translation: translation.value })}
                        />
                    </>
                }
            >
                <Redact>{translation.value}</Redact>
            </Header>
            <SingleColumn>
                <ColumnHeading>{t('rating.heading')}</ColumnHeading>
                <p>
                    <Trans
                        t={t}
                        i18nKey={
                            term.adminTags.translationsAsVariants ? 'term.variants.usage' : 'rating.overlayHeading'
                        }
                        components={{
                            Term: <TermWithLang term={term} />,
                            Translation: <TermWithLang term={translation} />,
                        }}
                    />
                </p>
                <div className={clsx(s.rating, getDominantLanguageClass(translation.lang))}>
                    <div className={s.ratingInner}>
                        <RatingContainer term={term} translation={translation} />
                    </div>
                </div>
            </SingleColumn>
            {!term.adminTags.disableExamples && (
                <Suspense fallback={null}>
                    <TranslationExamplesList
                        term={term}
                        translation={translation}
                        getTranslationExamples={getTranslationExamples}
                        getSources={getSources}
                    />
                </Suspense>
            )}
            {term.adminTags.enableCommentsOnTranslations && (
                <SingleColumn>
                    <div className={clsx(s.comments, getDominantLanguageClass(translation.lang))}>
                        <Comments
                            entityRef={collections.translations.doc(translation.id)}
                            commentCount={translation.commentCount}
                        />
                    </div>
                </SingleColumn>
            )}
        </>
    );
}

function DeleteTranslation({ translation }: { translation: Translation }) {
    const { t } = useTranslation();

    return (
        <ConfirmModal
            title={t('translation.deleteHeading')}
            body={<p>{t('translation.deleteExplanation')}</p>}
            confirmLabel={t('common.formNav.delete')}
            onConfirm={() => collections.translations.doc(translation.id).delete()}
        >
            {onClick => <LinkButton onClick={onClick}>{t('common.formNav.delete')}</LinkButton>}
        </ConfirmModal>
    );
}

function EditTranslation({ translation }: { translation: Translation }) {
    const [editOpen, setEditOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <LinkButton
                onClick={() => {
                    setEditOpen(true);
                }}
            >
                {t('common.entities.translation.edit')}
            </LinkButton>
            {editOpen && (
                <EditTranslationOverlay
                    translation={translation}
                    onClose={() => {
                        setEditOpen(false);
                    }}
                />
            )}
        </>
    );
}

function EditTranslationOverlay({ translation, onClose }: { translation: Translation; onClose: () => void }) {
    const { t } = useTranslation();
    const { userProperties } = useAppContext();
    const [saving, setIsSaving] = useState(false);
    const [value, setValue] = useState(translation.value);

    const onSave = () => {
        setIsSaving(true);
        collections.translations
            .doc(translation.id)
            .set({ ...translation, value })
            .then(() => {
                setIsSaving(false);
                onClose();
            });
    };

    return (
        <ModalDialog title={t('common.entities.translation.edit')} onClose={onClose}>
            {saving ? (
                <>{t('common.saving')}</>
            ) : (
                <>
                    <InputContainer>
                        <Input
                            label={t('common.entities.translation.value')}
                            value={value}
                            onChange={({ target: { value } }) => setValue(value)}
                        />
                    </InputContainer>

                    {userProperties?.admin && (
                        <>
                            <h3>Definition (10-15 words)</h3>
                            <InputContainer>
                                <Textarea label={`definition ${langA}`} />
                                <Textarea label={`definition ${langB}`} />
                            </InputContainer>
                        </>
                    )}

                    <ButtonContainer>
                        <Button onClick={onClose}>{t('common.formNav.cancel')}</Button>
                        <Button onClick={onSave} primary>
                            {t('common.formNav.save')}
                        </Button>
                    </ButtonContainer>
                </>
            )}
        </ModalDialog>
    );
}
