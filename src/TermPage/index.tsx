import firebase from 'firebase/app';
import { Suspense, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Comments from '../Comments';
import ConfirmModal from '../ConfirmModal';
import Button, { ButtonContainer } from '../Form/Button';
import { Checkbox } from '../Form/Checkbox';
import { Input, Select, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { useAppContext } from '../hooks/appContext';
import { collections, getSourcesRef, getSubscriptionRef, getTranslationsRef } from '../hooks/data';
import { Get, GetList, useCollection, useDocument } from '../hooks/fetch';
import { langA, langB } from '../languages';
import { FullWidthColumn, SingleColumn } from '../Layout/Columns';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import { Redact, useRedacted } from '../RedactSensitiveTerms';
import SidebarTermRedirectWrapper from '../SidebarTermRedirectWrapper';
import { TermWithLang } from '../TermWithLang';
import { TranslationsList } from '../TranslationsList';
import { Lang, Source, Term, Translation, User } from '../types';
import { useLang } from '../useLang';
import { getDominantLanguageClass } from '../useLangCssVars';
import { UserInlineDisplay } from '../UserInlineDisplay';
import s from './style.module.css';

type Props = {
    getTerm: Get<Term>;
    getTranslations: GetList<Translation>;
    getSources: GetList<Source>;
};

export default function TermPageWrapper() {
    const { termId } = useParams<{ termId: string }>();
    const termRef = collections.terms.doc(termId);
    const getTerm = useDocument(termRef);
    const getTranslations = useCollection(getTranslationsRef(termRef));
    const getSources = useCollection(getSourcesRef(termRef));
    return (
        <SidebarTermRedirectWrapper getTerm={getTerm}>
            <TermPage getTerm={getTerm} getTranslations={getTranslations} getSources={getSources} />
        </SidebarTermRedirectWrapper>
    );
}

function TermPage({ getTerm, getTranslations, getSources }: Props) {
    const { user, userProperties } = useAppContext();
    const { t } = useTranslation();
    const term = getTerm();
    const termRedacted = useRedacted(term.value);
    const canEdit = term.creator.id === user?.id || userProperties?.admin;
    const canDelete = userProperties?.admin;
    const [lang] = useLang();
    const adminComment = term.adminComment[lang === langA ? 'langA' : 'langB'];

    return (
        <>
            <Header
                capitalize
                subLine={
                    <>
                        {!term.adminTags.translationsAsVariants && (
                            <Trans
                                t={t}
                                i18nKey="common.addedOn"
                                components={{
                                    User: <UserInlineDisplay {...term.creator} />,
                                    FormatDate: <FormatDate date={term.createdAt} />,
                                }}
                            />
                        )}
                        {canEdit && (
                            <>
                                {' | '}
                                <EditTerm term={term} />
                            </>
                        )}
                        {canDelete && (
                            <>
                                {' | '}
                                <DeleteTerm term={term} />
                            </>
                        )}
                        {user && (
                            <Suspense fallback={null}>
                                {' | '}
                                <SubscribeTerm term={term} user={user} />
                            </Suspense>
                        )}
                    </>
                }
                mainLang={term.lang}
            >
                <Redact>{term.value}</Redact>
            </Header>

            {adminComment && (
                <SingleColumn>
                    <div className={s.adminComment}>{adminComment}</div>
                </SingleColumn>
            )}

            <FullWidthColumn>
                <TranslationsList term={term} getTranslations={getTranslations} getSources={getSources} />
            </FullWidthColumn>

            <SingleColumn>
                <div className={getDominantLanguageClass(term.lang)}>
                    <Comments
                        entityRef={collections.terms.doc(term.id)}
                        commentCount={term.commentCount}
                        headingHint={
                            <>
                                {!term.adminTags.translationsAsVariants && (
                                    <Trans
                                        t={t}
                                        i18nKey="term.addCommentHeading"
                                        components={{ Term: <TermWithLang term={term} /> }}
                                    />
                                )}
                            </>
                        }
                        placeholder={
                            term.adminTags.translationsAsVariants
                                ? undefined
                                : t('term.commentPlaceholder', { term: termRedacted })
                        }
                    />
                </div>
            </SingleColumn>
        </>
    );
}

function SubscribeTerm({ term, user }: { term: Term; user: User }) {
    const subscriptionRef = getSubscriptionRef(user.id, term.id);
    const getSubscription = useDocument(subscriptionRef);
    const subscription = getSubscription(true);
    const active = !!subscription?.active;
    const toggleSubscription = () => {
        if (subscription) {
            subscriptionRef.update({
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                active: !active,
            });
        } else {
            subscriptionRef.set({
                creator: {
                    id: user.id,
                    displayName: user.displayName,
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp,
                updatedAt: null,
                active: !active,
            });
        }
    };
    return <LinkButton onClick={toggleSubscription}>{active ? 'Unsubscribe' : 'Subscribe'}</LinkButton>;
}

function DeleteTerm({ term }: { term: Term }) {
    const { t } = useTranslation();

    return (
        <ConfirmModal
            title={t('term.deleteHeading')}
            body={<p>{t('term.deleteExplanation')}</p>}
            confirmLabel={t('common.formNav.delete')}
            onConfirm={() => collections.terms.doc(term.id).delete()}
        >
            {onClick => <LinkButton onClick={onClick}>{t('common.formNav.delete')}</LinkButton>}
        </ConfirmModal>
    );
}

function EditTerm({ term }: { term: Term }) {
    const [editOpen, setEditOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <LinkButton
                onClick={() => {
                    setEditOpen(true);
                }}
            >
                {t('common.entities.term.edit')}
            </LinkButton>
            {editOpen && (
                <EditTermOverlay
                    term={term}
                    onClose={() => {
                        setEditOpen(false);
                    }}
                />
            )}
        </>
    );
}

function EditTermOverlay({ term, onClose }: { term: Term; onClose: () => void }) {
    const { userProperties } = useAppContext();
    const { t } = useTranslation();
    const [saving, setIsSaving] = useState(false);
    const [value, setValue] = useState(term.value);
    const [lang, setLang] = useState(term.lang);
    const [adminComment, setAdminComment] = useState(term.adminComment);
    const [adminTags, setAdminTags] = useState(term.adminTags);

    const onSave = () => {
        setIsSaving(true);
        collections.terms
            .doc(term.id)
            .set({ ...term, value, lang, adminComment, adminTags })
            .then(() => {
                setIsSaving(false);
                onClose();
            });
    };

    return (
        <ModalDialog title={t('common.entities.term.edit')} onClose={onClose}>
            {saving ? (
                <>{t('common.saving')}</>
            ) : (
                <>
                    <InputContainer>
                        <Input
                            label={t('common.entities.term.value')}
                            span={3}
                            value={value}
                            onChange={({ target: { value } }) => setValue(value)}
                        />
                        <Select
                            label={t('common.langLabels.language')}
                            span={1}
                            value={lang}
                            onChange={({ target: { value } }) => setLang(value as Lang)}
                        >
                            <option value={langA}>{t(`common.langLabels.${langA}` as const)}</option>
                            <option value={langB}>{t(`common.langLabels.${langB}` as const)}</option>
                        </Select>
                    </InputContainer>

                    {userProperties?.admin && (
                        <>
                            <h3>Admin</h3>
                            <InputContainer>
                                <Textarea
                                    label={`admin comment ${langA}`}
                                    value={adminComment.langA}
                                    onChange={({ target: { value } }) =>
                                        setAdminComment(before => ({ ...before, langA: value }))
                                    }
                                />
                                <Textarea
                                    label={`admin comment ${langB}`}
                                    value={adminComment.langB}
                                    onChange={({ target: { value } }) =>
                                        setAdminComment(before => ({ ...before, langB: value }))
                                    }
                                />
                            </InputContainer>
                            <div style={{ margin: '1rem 0' }}>
                                <Checkbox
                                    checked={adminTags.hightlightLandingPage}
                                    onChange={({ target: { checked } }) => {
                                        setAdminTags(before => ({ ...before, hightlightLandingPage: checked }));
                                    }}
                                    label="Highlight landing page"
                                />
                            </div>
                            <div style={{ margin: '.5rem 0' }}>
                                <Checkbox
                                    checked={adminTags.showInSidebar}
                                    onChange={({ target: { checked } }) => {
                                        setAdminTags(before => ({ ...before, showInSidebar: checked }));
                                    }}
                                    label="Show in sidebar"
                                />
                            </div>
                            <div style={{ margin: '.5rem 0' }}>
                                <Checkbox
                                    checked={adminTags.hideFromList}
                                    onChange={({ target: { checked } }) => {
                                        setAdminTags(before => ({ ...before, hideFromList: checked }));
                                    }}
                                    label="Hide from list"
                                />
                            </div>
                            <div style={{ margin: '.5rem 0' }}>
                                <Checkbox
                                    checked={adminTags.disableExamples}
                                    onChange={({ target: { checked } }) => {
                                        setAdminTags(before => ({ ...before, disableExamples: checked }));
                                    }}
                                    label="Disable Examples"
                                />
                            </div>
                            <div style={{ margin: '.5rem 0' }}>
                                <Checkbox
                                    checked={adminTags.enableCommentsOnTranslations}
                                    onChange={({ target: { checked } }) => {
                                        setAdminTags(before => ({ ...before, enableCommentsOnTranslations: checked }));
                                    }}
                                    label="Enable Comments on Translations"
                                />
                            </div>
                            <div style={{ margin: '.5rem 0' }}>
                                <Checkbox
                                    checked={adminTags.translationsAsVariants}
                                    onChange={({ target: { checked } }) => {
                                        setAdminTags(before => ({ ...before, translationsAsVariants: checked }));
                                    }}
                                    label="Is 'about gender'-page (changes wording)"
                                />
                            </div>
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
