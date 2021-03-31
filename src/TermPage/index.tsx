import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Comments from '../Comments';
import Button, { ButtonContainer } from '../Form/Button';
import { Input, Select } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { useAppContext } from '../hooks/appContext';
import { collections, useTerm } from '../hooks/data';
import { langA, langB } from '../languages';
import { FullWidthColumn, SingleColumn } from '../Layout/Columns';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import { Redact, useRedacted } from '../RedactSensitiveTerms';
import { TermWithLang } from '../TermWithLang';
import { TranslationsList } from '../TranslationsList';
import { Lang, Term } from '../types';
import { getDominantLanguageClass } from '../useLangCssVars';

export default function TermPage() {
    const { termId } = useParams<{ termId: string }>();
    const { t } = useTranslation();
    const term = useTerm(termId);
    const termRedacted = useRedacted(term.value);

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
                                User: term.creator.displayName,
                                FormatDate: <FormatDate date={term.createdAt} />,
                            }}
                        />
                        <EditTerm term={term} />
                    </>
                }
                mainLang={term.lang}
            >
                <Redact>{term.value}</Redact>
            </Header>

            <FullWidthColumn>
                <TranslationsList term={term} />
            </FullWidthColumn>

            <SingleColumn>
                <div className={getDominantLanguageClass(term.lang)}>
                    <Comments
                        entityRef={collections.terms.doc(termId)}
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

function EditTerm({ term }: { term: Term }) {
    const { user, userProperties } = useAppContext();
    const [editOpen, setEditOpen] = useState(false);
    const { t } = useTranslation();
    const canEdit = term.creator.id === user?.id || userProperties?.admin;

    if (!canEdit) {
        return null;
    }

    return (
        <div>
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
        </div>
    );
}

function EditTermOverlay({ term, onClose }: { term: Term; onClose: () => void }) {
    const { t } = useTranslation();
    const [saving, setIsSaving] = useState(false);
    const [value, setValue] = useState(term.value);
    const [lang, setLang] = useState<Lang>(term.lang);

    const onSave = () => {
        setIsSaving(true);
        collections.terms
            .doc(term.id)
            .set({ ...term, value, lang })
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
