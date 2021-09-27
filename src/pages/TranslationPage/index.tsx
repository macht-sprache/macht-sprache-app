import clsx from 'clsx';
import { Suspense, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import Comments from '../../components/Comments';
import ConfirmModal from '../../components/ConfirmModal';
import Button, { ButtonContainer } from '../../components/Form/Button';
import { Input, Textarea } from '../../components/Form/Input';
import InputContainer from '../../components/Form/InputContainer';
import { FormatDate } from '../../components/FormatDate';
import Header from '../../components/Header';
import { useAppContext } from '../../hooks/appContext';
import { collections, getSourcesRef, getTranslationExamplesRef } from '../../hooks/data';
import { Get, GetList, useCollection, useDocument } from '../../hooks/fetch';
import { langA, langB } from '../../languages';
import { ColumnHeading, SingleColumn } from '../../components/Layout/Columns';
import LinkButton from '../../components/LinkButton';
import { ModalDialog } from '../../components/ModalDialog';
import PageTitle from '../../components/PageTitle';
import { RatingContainer } from '../../components/Rating';
import { Redact } from '../../components/RedactSensitiveTerms';
import { TERM } from '../../routes';
import Share from '../../components/Share';
import SidebarTermRedirectWrapper from '../../components/SidebarTermRedirectWrapper';
import { TermWithLang } from '../../components/TermWithLang';
import TranslationExamplesList from '../../components/TranslationExamplesList';
import { Source, Term, Translation, TranslationExample } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import { UserInlineDisplay } from '../../components/UserInlineDisplay';
import s from './style.module.css';
import { useLang } from '../../useLang';

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
    const [lang] = useLang();
    const definition = translation.definition[lang === langA ? 'langA' : 'langB'];

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
                        {definition && <p className={s.defintion}>{definition}</p>}
                    </>
                }
                rightHandSideContent={
                    <Share
                        itemTranslated={t('common.entities.translation.value')}
                        title={`macht.sprache.: ${translation.value}`}
                        text={t('translation.share', { term: term.value, translation: translation.value })}
                        rightAlignedOnBigScreen={true}
                    />
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
    const [definition, setDefinition] = useState(translation.definition);

    const onSave = () => {
        setIsSaving(true);
        collections.translations
            .doc(translation.id)
            .set({ ...translation, definition, value })
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
                                <Textarea
                                    label={`definition ${langA}`}
                                    value={definition.langA}
                                    onChange={({ target: { value } }) =>
                                        setDefinition(before => ({ ...before, langA: value }))
                                    }
                                />
                                <Textarea
                                    label={`definition ${langB}`}
                                    value={definition.langB}
                                    onChange={({ target: { value } }) =>
                                        setDefinition(before => ({ ...before, langB: value }))
                                    }
                                />
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
