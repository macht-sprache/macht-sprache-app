import { useState } from 'react';
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
import { collections, getSourcesRef, getTranslationsRef } from '../hooks/data';
import { Get, GetList, useCollection, useDocument } from '../hooks/fetch';
import { langA, langB } from '../languages';
import { FullWidthColumn, SingleColumn } from '../Layout/Columns';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import { Redact, useRedacted } from '../RedactSensitiveTerms';
import { TermWithLang } from '../TermWithLang';
import { TranslationsList } from '../TranslationsList';
import { Lang, Source, Term, Translation } from '../types';
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
    return <TermPage getTerm={getTerm} getTranslations={getTranslations} getSources={getSources} />;
}

function TermPage({ getTerm, getTranslations, getSources }: Props) {
    const { user, userProperties } = useAppContext();
    const { t } = useTranslation();
    const term = getTerm();
    const termRedacted = useRedacted(term.value);
    const canEdit = term.creator.id === user?.id || userProperties?.admin;
    const canDelete = userProperties?.admin;

    return (
        <>
            <Header
                capitalize
                subLine={
                    <>
                        <Trans
                            t={t}
                            i18nKey="common.addedOn"
                            components={{
                                User: <UserInlineDisplay {...term.creator} />,
                                FormatDate: <FormatDate date={term.createdAt} />,
                            }}
                        />
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
                    </>
                }
                mainLang={term.lang}
            >
                <Redact>{term.value}</Redact>
            </Header>

            {term.adminComment && (
                <SingleColumn>
                    <div className={s.adminComment}>{term.adminComment}</div>
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
                            <Trans
                                t={t}
                                i18nKey="term.addCommentHeading"
                                components={{ Term: <TermWithLang term={term} /> }}
                            />
                        }
                        placeholder={t('term.commentPlaceholder', { term: termRedacted })}
                    />
                </div>
            </SingleColumn>
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
    const [adminComment, setAdminComment] = useState(term?.adminComment ?? '');
    const [weekHighlight, setWeekHighlight] = useState(term?.weekHighlight ?? false);

    const onSave = () => {
        setIsSaving(true);
        collections.terms
            .doc(term.id)
            .set({ ...term, value, lang, adminComment, weekHighlight })
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
                                    label="admin comment"
                                    value={adminComment}
                                    onChange={({ target: { value } }) => setAdminComment(value)}
                                    minHeight="300px"
                                />
                            </InputContainer>
                            <div style={{ margin: '1rem 0' }}>
                                <Checkbox
                                    checked={weekHighlight}
                                    onChange={({ target: { checked } }) => {
                                        setWeekHighlight(checked);
                                    }}
                                    label="Highlight landing page"
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
