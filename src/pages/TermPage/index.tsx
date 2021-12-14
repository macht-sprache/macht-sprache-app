import firebase from 'firebase/compat/app';
import xor from 'lodash/xor';
import { Suspense, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import BetaWrapper from '../../components/BetaWrapper';
import Comments from '../../components/Comments';
import ConfirmModal from '../../components/ConfirmModal';
import DividedList from '../../components/DividedList';
import EditVariants from '../../components/EditVariants';
import Button, { ButtonContainer } from '../../components/Form/Button';
import { Checkbox } from '../../components/Form/Checkbox';
import { Input, Select, Textarea } from '../../components/Form/Input';
import InputContainer from '../../components/Form/InputContainer';
import { FormatDateShort } from '../../components/FormatDate';
import Header from '../../components/Header';
import { FullWidthColumn, SingleColumn } from '../../components/Layout/Columns';
import LinkButton from '../../components/LinkButton';
import Linkify from '../../components/Linkify';
import { ModalDialog } from '../../components/ModalDialog';
import PageTitle from '../../components/PageTitle';
import { Redact, useRedacted } from '../../components/RedactSensitiveTerms';
import Share from '../../components/Share';
import SidebarTermRedirectWrapper from '../../components/SidebarTermRedirectWrapper';
import { TermWithLang } from '../../components/TermWithLang';
import { TranslationsList } from '../../components/TranslationsList';
import { UserInlineDisplay } from '../../components/UserInlineDisplay';
import { useAppContext } from '../../hooks/appContext';
import { collections, getSourcesRef, getSubscriptionRef, getTranslationsRef } from '../../hooks/data';
import { Get, GetList, useCollection, useDocument } from '../../hooks/fetch';
import { langA, langB } from '../../languages';
import { Guideline, guidelineKeys, useGuidelines } from '../../Manifesto/guidelines/guidelines';
import { MANIFESTO } from '../../routes';
import { Lang, Source, Term, Translation, User } from '../../types';
import { useLang } from '../../useLang';
import { getDominantLanguageClass } from '../../useLangCssVars';
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
    const definition = term.definition[lang === langA ? 'langA' : 'langB'];
    const getGuidelines = useGuidelines(term.guidelines);

    return (
        <>
            <PageTitle title={term.value} lang={term.lang} />
            <Header
                capitalize
                subLine={
                    <>
                        <DividedList>
                            {!term.adminTags.translationsAsVariants && (
                                <Trans
                                    t={t}
                                    i18nKey="common.addedOn"
                                    components={{
                                        User: <UserInlineDisplay {...term.creator} />,
                                        FormatDate: <FormatDateShort date={term.createdAt} />,
                                    }}
                                />
                            )}
                            {canEdit && <EditTerm term={term} />}
                            {userProperties?.admin && (
                                <EditVariants
                                    entity={term}
                                    entityRef={collections.terms.doc(term.id)}
                                    indexRef={collections.termIndex.doc(term.id)}
                                />
                            )}
                            {canDelete && <DeleteTerm term={term} />}
                        </DividedList>

                        {user && (
                            <Suspense fallback={<Checkbox disabled label={t('notifications.subscribe')} />}>
                                <SubscribeTerm term={term} user={user} />
                            </Suspense>
                        )}
                        {definition && <p className={s.defintion}>{definition}</p>}
                        {adminComment && (
                            <p className={s.adminComment}>
                                <Linkify>{adminComment}</Linkify>
                            </p>
                        )}
                        <BetaWrapper>
                            <Suspense fallback={null}>
                                <Guidelines getGuidelines={getGuidelines} />
                            </Suspense>
                        </BetaWrapper>
                    </>
                }
                mainLang={term.lang}
                rightHandSideContent={
                    <>
                        <Share
                            title={`macht.sprache.: ${term.value}`}
                            text={t('term.share', { term: term.value })}
                            itemTranslated={t('common.entities.term.value')}
                        />
                    </>
                }
            >
                <Redact>{term.value}</Redact>
            </Header>

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
    const { t } = useTranslation();
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
    return <Checkbox label={t('notifications.subscribe')} checked={active} onChange={toggleSubscription} />;
}

function Guidelines({ getGuidelines }: { getGuidelines: () => Guideline[] }) {
    const { t } = useTranslation();
    const guidelines = getGuidelines();

    if (!guidelines.length) {
        return null;
    }

    return (
        <>
            <h3 className={s.guidelineHeading}>{t('manifesto.guidelines')}</h3>
            <div className={s.guidelines}>
                {guidelines.map(guideline => (
                    <Link className={s.guideline} key={guideline.id} to={`${MANIFESTO}#${guideline.id}`}>
                        {guideline.title}
                    </Link>
                ))}
            </div>
        </>
    );
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
    const [definition, setDefinition] = useState(term.definition);
    const [adminTags, setAdminTags] = useState(term.adminTags);
    const [guidelines, setGuidelines] = useState(term.guidelines);

    const onSave = () => {
        setIsSaving(true);
        collections.terms
            .doc(term.id)
            .set({ ...term, value, lang, adminComment, definition, adminTags, guidelines })
            .then(() => {
                setIsSaving(false);
                onClose();
            });
    };

    const setAdminTag = (adminTag: string, checked: boolean) => {
        setAdminTags(before => ({ ...before, [adminTag]: checked }));
    };

    const adminCheckboxes: { label: string; tag: keyof Term['adminTags'] }[] = [
        {
            label: 'Highlight landing page',
            tag: 'hightlightLandingPage',
        },
        {
            label: 'Show in sidebar',
            tag: 'showInSidebar',
        },
        {
            label: 'Hide from list',
            tag: 'hideFromList',
        },
        {
            label: 'Disable Examples',
            tag: 'disableExamples',
        },
        {
            label: 'Enable Comments on Translations',
            tag: 'enableCommentsOnTranslations',
        },
        {
            label: "Is 'about gender'-page (changes wording)",
            tag: 'translationsAsVariants',
        },
    ];

    const definitionCheckboxes: { label: string; tag: keyof Term['adminTags'] }[] = [
        {
            label: 'Does not only have political meaning (adds hint in text checker)',
            tag: 'notOnlyPolitical',
        },
    ];

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
                            <h3>Defintion (~40 words)</h3>
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

                            {definitionCheckboxes.map(tag => (
                                <AdminCheckbox
                                    label={tag.label}
                                    adminTag={tag.tag}
                                    setAdminTag={setAdminTag}
                                    checked={adminTags[tag.tag]}
                                    key={tag.tag}
                                />
                            ))}

                            <h3>Guidelines from Manifesto</h3>
                            {guidelineKeys.map(guidelineKey => (
                                <GuidelineCheckbox
                                    key={guidelineKey}
                                    guideline={guidelineKey}
                                    checked={guidelines.includes(guidelineKey)}
                                    onChange={() => {
                                        setGuidelines(before => xor(before, [guidelineKey]));
                                    }}
                                />
                            ))}
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

                            {adminCheckboxes.map(tag => (
                                <AdminCheckbox
                                    label={tag.label}
                                    adminTag={tag.tag}
                                    setAdminTag={setAdminTag}
                                    checked={adminTags[tag.tag]}
                                    key={tag.tag}
                                />
                            ))}
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

function GuidelineCheckbox({
    guideline,
    onChange,
    checked,
}: {
    guideline: string;
    onChange: () => void;
    checked: boolean;
}) {
    return (
        <div style={{ margin: '.5rem 0' }}>
            <Checkbox checked={checked} onChange={onChange} label={guideline} />
        </div>
    );
}

function AdminCheckbox({
    adminTag,
    label,
    setAdminTag,
    checked,
}: {
    adminTag: string;
    label: string;
    setAdminTag: (adminTag: string, checked: boolean) => void;
    checked: boolean;
}) {
    return (
        <div style={{ margin: '.5rem 0' }}>
            <Checkbox
                checked={checked}
                onChange={({ target: { checked } }: { target: { checked: boolean } }) => {
                    setAdminTag(adminTag, checked);
                }}
                label={label}
            />
        </div>
    );
}
