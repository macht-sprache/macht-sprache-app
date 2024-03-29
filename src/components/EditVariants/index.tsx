import without from 'lodash/without';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Get, useDocument } from '../../hooks/fetch';
import { DocReference, Index, Term, Translation } from '../../types';
import DividedList from '../DividedList';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import s from './style.module.css';

type Entity = Term | Translation;

type Props<T extends Entity> = { entity: T; entityRef: DocReference<T>; indexRef: DocReference<Index<T>> };

export default function EditVariants<T extends Entity>({ entity, entityRef, indexRef }: Props<T>) {
    const [overlayOpen, setOverlayOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <LinkButton onClick={() => setOverlayOpen(true)}>{t('common.entities.variant.edit')}</LinkButton>
            {overlayOpen && (
                <EditVariantsOverlay
                    entity={entity}
                    entityRef={entityRef}
                    indexRef={indexRef}
                    onClose={() => setOverlayOpen(false)}
                />
            )}
        </>
    );
}

type OverlayProps<T extends Entity> = Props<T> & {
    onClose: () => void;
};

function EditVariantsOverlay<T extends Entity>({ entity, entityRef, indexRef, onClose }: OverlayProps<T>) {
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [variants, setVariants] = useState(entity.variants);
    const getIndex = useDocument(indexRef);

    const onSave = () => {
        setIsSaving(true);
        entityRef.update({ variants: variants.filter(variant => variant) }).then(() => {
            setIsSaving(false);
            onClose();
        });
    };

    return (
        <ModalDialog title={t('common.entities.variant.edit')} onClose={onClose}>
            <IndexDisplay getIndex={getIndex} />
            <div className={s.variants}>
                {variants.length === 0 ? (
                    t('common.entities.variant.empty')
                ) : (
                    <>
                        {variants.map((variant, index) => (
                            <Variant
                                key={index}
                                variant={variant}
                                onChange={newVariant =>
                                    setVariants(prevVariants => {
                                        const newVariants = [...prevVariants];
                                        newVariants[index] = newVariant;
                                        return newVariants;
                                    })
                                }
                                onDelete={() => setVariants(prev => without(prev, prev[index]))}
                                isSaving={isSaving}
                            />
                        ))}
                    </>
                )}
            </div>
            <div className={s.addButtonContainer}>
                <ButtonContainer align="center">
                    <Button onClick={() => setVariants(prev => [...prev, ''])} disabled={isSaving}>
                        {t('common.entities.variant.add')}
                    </Button>
                </ButtonContainer>
            </div>
            <ButtonContainer>
                <Button disabled={isSaving} onClick={() => onClose()}>
                    {t('common.formNav.cancel')}
                </Button>
                <Button disabled={isSaving} onClick={() => onSave()} busy={isSaving} primary>
                    {isSaving ? t('common.saving') : t('common.formNav.save')}
                </Button>
            </ButtonContainer>
        </ModalDialog>
    );
}

function Variant({
    variant,
    onChange,
    onDelete,
    isSaving,
}: {
    variant: string;
    onChange: (variant: string) => void;
    onDelete: () => void;
    isSaving: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div className={s.variant}>
            <InputContainer>
                <Input
                    type="text"
                    value={variant}
                    label="Variant"
                    onChange={event => onChange(event.currentTarget.value)}
                    disabled={isSaving}
                    span={3}
                />
                <Button onClick={onDelete} disabled={isSaving}>
                    {t('common.formNav.delete')}
                </Button>
            </InputContainer>
        </div>
    );
}

function IndexDisplay<T extends Entity>({ getIndex }: { getIndex: Get<Index<T>> }) {
    const index = getIndex(true);

    if (!index) {
        return null;
    }

    return (
        <p lang={index.lang}>
            <DividedList divider=", ">
                {index.lemmas.map((ll, i) => (
                    <DividedList key={i} divider="|">
                        {ll.map(l => l)}
                    </DividedList>
                ))}
            </DividedList>
        </p>
    );
}
