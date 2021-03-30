import clsx from 'clsx';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import ConfirmModal from '../ConfirmModal';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { FormatDate } from '../FormatDate';
import Header from '../Header';
import { useAppContext } from '../hooks/appContext';
import { collections, useTerm, useTranslationEntity } from '../hooks/data';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import { RatingWidgetContainer } from '../Rating/RatingWidget';
import { Redact } from '../RedactSensitiveTerms';
import { TERM } from '../routes';
import { WrappedInLangColor } from '../TermWithLang';
import TranslationExamplesList from '../TranslationExamplesList';
import { Translation } from '../types';
import { getDominantLanguageClass } from '../useLangCssVars';
import { UserInlineDisplay } from '../UserInlineDisplay';
import s from './style.module.css';

export function TranslationPage() {
    const { user, userProperties } = useAppContext();
    const { t } = useTranslation();
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);
    const canEdit = translation.creator.id === user?.id || userProperties?.admin;
    const canDelete = userProperties?.admin;

    return (
        <>
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
                        i18nKey="rating.overlayHeading"
                        values={{
                            translation: translation.value,
                            term: term.value,
                        }}
                        components={{
                            Term: <WrappedInLangColor lang={term.lang} />,
                            Translation: <WrappedInLangColor lang={translation.lang} />,
                        }}
                    />
                </p>
                <div className={clsx(s.rating, getDominantLanguageClass(translation.lang))}>
                    <div className={s.ratingInner}>
                        <RatingWidgetContainer term={term} translation={translation} />
                    </div>
                </div>
            </SingleColumn>

            <TranslationExamplesList term={term} translation={translation} />
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
