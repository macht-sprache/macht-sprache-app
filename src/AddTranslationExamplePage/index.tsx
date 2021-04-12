import clsx from 'clsx';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { SNIPPET_MAX_LENGTH } from '../constants';
import Button, { ButtonContainer } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { addTranslationExample } from '../functions';
import { collections } from '../hooks/data';
import { Get, useDocument } from '../hooks/fetch';
import { Columns, FullWidthColumn } from '../Layout/Columns';
import BookSearch from '../MediaSelection/BookSearch';
import MovieSearch from '../MediaSelection/MovieSearch';
import WebPageSearch from '../MediaSelection/WebPageSearch';
import { ModalDialog } from '../ModalDialog';
import { TranslationExampleModel } from '../modelTypes';
import { TRANSLATION_EXAMPLE } from '../routes';
import SavingState from '../SavingState';
import SidebarTermRedirectWrapper from '../SidebarTermRedirectWrapper';
import { TermWithLang } from '../TermWithLang';
import { Lang, SourceMediaForType, SourceType, Term, Translation } from '../types';
import { getDominantLanguageClass } from '../useLangCssVars';
import s from './style.module.css';
import { TypeSelector, TypeSelectorContainer } from './TypeSelector';

type SnippetModel<T extends SourceType = SourceType> = Partial<{
    sourceMedium: SourceMediaForType<T>;
    text: string;
    pageNumber: string;
}>;

type Model<T extends SourceType = SourceType> = {
    type?: T;
    original: SnippetModel<T>;
    translated: SnippetModel<T>;
};

type StepProps<T extends SourceType = SourceType> = {
    model: Model<T>;
    term: Term;
    translation: Translation;
    onChange: Dispatch<SetStateAction<Model<T>>>;
};

const toTranslationExampleModel = (
    term: Term,
    translation: Translation,
    model: Model
): TranslationExampleModel | undefined => {
    if (
        !model.type ||
        !model.original.text ||
        !model.original.sourceMedium ||
        !model.translated.text ||
        !model.translated.sourceMedium
    ) {
        return;
    }

    return {
        termId: term.id,
        translationId: translation.id,
        type: model.type,
        original: {
            sourceId: model.original.sourceMedium.id,
            text: model.original.text,
            pageNumber: model.original.pageNumber,
        },
        translated: {
            sourceId: model.translated.sourceMedium.id,
            text: model.translated.text,
            pageNumber: model.translated.pageNumber,
        },
    };
};

export default function AddTranslationExamplePage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const getTerm = useDocument(collections.terms.doc(termId));
    const getTranslation = useDocument(collections.translations.doc(translationId));

    return (
        <SidebarTermRedirectWrapper getTerm={getTerm}>
            <AddTranslationExample getTerm={getTerm} getTranslation={getTranslation} />
        </SidebarTermRedirectWrapper>
    );
}

function AddTranslationExample({ getTerm, getTranslation }: { getTerm: Get<Term>; getTranslation: Get<Translation> }) {
    const { t } = useTranslation();
    const history = useHistory();
    const [model, onChange] = useState<Model>({ original: {}, translated: {} });
    const [{ saving, error }, setSaveState] = useState({ saving: false, error: false });

    const term = getTerm();
    const translation = getTranslation();

    const save = () => {
        const translationExampleModel = toTranslationExampleModel(term, translation, model);

        if (!translationExampleModel) {
            console.error('Incomplete TranslationExampleModel', model);
            return;
        }

        setSaveState({ saving: true, error: false });

        addTranslationExample(translationExampleModel).then(
            ({ data }) => {
                setSaveState({ saving: false, error: false });
                history.push(
                    generatePath(TRANSLATION_EXAMPLE, {
                        termId: term.id,
                        translationId: translation.id,
                        translationExampleId: data.translationExampleId,
                    })
                );
            },
            error => {
                console.error(error);
                setSaveState({ saving: false, error: true });
            }
        );
    };

    const stepProps = {
        model,
        onChange,
        term,
        translation,
    };

    const isValid =
        !!(model.original.sourceMedium && model.translated.sourceMedium) &&
        !!(model.original.text && model.translated.text);

    return (
        <ModalDialog
            title={
                <Trans
                    t={t}
                    i18nKey="translationExample.add"
                    components={{
                        Term: <TermWithLang term={term} />,
                        Translation: <TermWithLang term={translation} />,
                    }}
                />
            }
            onClose={() => {
                history.goBack();
            }}
            width="wider"
        >
            <div className={clsx(s.wrapper, getDominantLanguageClass(translation.lang))}>
                {saving ? (
                    <SavingState />
                ) : (
                    <>
                        <FullWidthColumn>
                            <Heading>{t('translationExample.steps.type.label')}</Heading>
                            <SelectType {...stepProps} />
                        </FullWidthColumn>
                        {!!model.type && (
                            <>
                                <FullWidthColumn>
                                    <Heading>{t('translationExample.steps.source.label')}</Heading>
                                    <SelectMedia {...stepProps} />{' '}
                                </FullWidthColumn>
                                <FullWidthColumn>
                                    <Heading>{t('translationExample.steps.example.label')}</Heading>
                                    <AddSnippet {...stepProps} />{' '}
                                </FullWidthColumn>
                            </>
                        )}

                        {error && <ErrorBox>{t('common.error.general')}</ErrorBox>}

                        <FullWidthColumn>
                            <ButtonContainer>
                                <Button
                                    onClick={() => {
                                        history.goBack();
                                    }}
                                >
                                    {t('common.formNav.cancel')}
                                </Button>
                                <Button primary onClick={save} disabled={!isValid}>
                                    {t('common.formNav.save')}
                                </Button>
                            </ButtonContainer>
                        </FullWidthColumn>
                    </>
                )}
            </div>
        </ModalDialog>
    );
}

function SelectType({ model, onChange }: StepProps) {
    const { t } = useTranslation();
    return (
        <>
            <p className={s.sourceDescription}>{t('translationExample.steps.type.description')}</p>
            <TypeSelectorContainer
                name="type"
                value={model.type}
                onChange={type => onChange(() => ({ original: {}, translated: {}, type }))}
            >
                <TypeSelector value="BOOK" label={t('translationExample.types.BOOK')} />
                <TypeSelector value="WEBPAGE" label={t('translationExample.types.WEBSITE')} />
                <TypeSelector value="MOVIE" label={t('translationExample.types.MOVIE')} />
                {/* <TypeSelector value="OTHER" label={t('translationExample.types.OTHER')} disabled /> */}
            </TypeSelectorContainer>
        </>
    );
}

function SelectMedia({ ...stepProps }: StepProps) {
    switch (stepProps.model.type) {
        case 'BOOK':
            return <BookSelection {...(stepProps as StepProps<'BOOK'>)} />;
        case 'MOVIE':
            return <MovieSelection {...(stepProps as StepProps<'MOVIE'>)} />;
        case 'WEBPAGE':
            return <WebPageSelection {...(stepProps as StepProps<'WEBPAGE'>)} />;
        default:
            return null;
    }
}

function BookSelection({ term, translation, model, onChange }: StepProps<'BOOK'>) {
    const { t } = useTranslation();

    return (
        <AddContentSection
            translationLang={translation.lang}
            termLang={term.lang}
            description={t('translationExample.source.BOOK.description')}
            originalHeading={`${t('translationExample.source.BOOK.titleOriginal')} (${t(
                `common.langLabels.${term.lang}` as const
            )})`}
            originalColumn={
                <BookSearch
                    label={t('translationExample.source.BOOK.searchOriginal')}
                    lang={term.lang}
                    selectedBook={model.original.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                    }
                />
            }
            translatedHeading={`${t('translationExample.source.BOOK.titleTranslated')} (${t(
                `common.langLabels.${translation.lang}` as const
            )})`}
            translatedColumn={
                <BookSearch
                    label={t('translationExample.source.BOOK.searchTranslation')}
                    lang={translation.lang}
                    selectedBook={model.translated.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                    }
                />
            }
        />
    );
}

function MovieSelection({ term, translation, model, onChange }: StepProps<'MOVIE'>) {
    const { t } = useTranslation();

    return (
        <AddContentSection
            translationLang={translation.lang}
            termLang={term.lang}
            // description={t('translationExample.source.MOVIE.description')}
            originalHeading={`${t('translationExample.source.MOVIE.titleOriginal')} (${t(
                `common.langLabels.${term.lang}` as const
            )})`}
            originalColumn={
                <MovieSearch
                    label={t('translationExample.source.MOVIE.searchOriginal')}
                    lang={term.lang}
                    selectedMovie={model.original.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                    }
                />
            }
            translatedHeading={`${t('translationExample.source.MOVIE.titleTranslated')} (${t(
                `common.langLabels.${translation.lang}` as const
            )})`}
            translatedColumn={
                <MovieSearch
                    label={t('translationExample.source.MOVIE.searchTranslation')}
                    lang={translation.lang}
                    selectedMovie={model.translated.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                    }
                />
            }
        />
    );
}

function WebPageSelection({ term, translation, model, onChange }: StepProps<'WEBPAGE'>) {
    const { t } = useTranslation();
    return (
        <AddContentSection
            translationLang={translation.lang}
            termLang={term.lang}
            description={t('translationExample.source.WEBPAGE.description')}
            originalHeading={`${t('translationExample.source.WEBPAGE.titleOriginal')} (${t(
                `common.langLabels.${term.lang}` as const
            )})`}
            originalColumn={
                <WebPageSearch
                    label={t('translationExample.source.WEBPAGE.searchOriginal')}
                    lang={term.lang}
                    selectedPage={model.original.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                    }
                />
            }
            translatedHeading={`${t('translationExample.source.WEBPAGE.titleTranslated')} (${t(
                `common.langLabels.${translation.lang}` as const
            )})`}
            translatedColumn={
                <WebPageSearch
                    label={t('translationExample.source.WEBPAGE.searchTranslation')}
                    lang={translation.lang}
                    selectedPage={model.translated.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                    }
                />
            }
        />
    );
}
function AddSnippet({ term, translation, model, onChange }: StepProps) {
    return (
        <AddContentSection
            translationLang={translation.lang}
            termLang={term.lang}
            originalHeading={
                <Trans
                    i18nKey="translationExample.snippet.description"
                    components={{ Term: <TermWithLang term={term} /> }}
                />
            }
            originalColumn={
                <SnippetSelection
                    showPageNumber={model.type === 'BOOK'}
                    snippet={model.original}
                    onChange={updater => onChange(prev => ({ ...prev, original: updater(prev.original) }))}
                />
            }
            translatedHeading={
                <Trans
                    i18nKey="translationExample.snippet.description"
                    components={{ Term: <TermWithLang term={translation} /> }}
                />
            }
            translatedColumn={
                <SnippetSelection
                    showPageNumber={model.type === 'BOOK'}
                    snippet={model.translated}
                    onChange={updater => onChange(prev => ({ ...prev, translated: updater(prev.translated) }))}
                />
            }
        />
    );
}

function SnippetSelection({
    showPageNumber,
    snippet,
    onChange,
}: {
    showPageNumber?: boolean;
    snippet: SnippetModel;
    onChange: (updater: (prev: SnippetModel) => SnippetModel) => void;
}) {
    const { t } = useTranslation();

    return (
        <div>
            <InputContainer>
                <Textarea
                    label={t('translationExample.snippet.label')}
                    value={snippet.text || ''}
                    maxLength={SNIPPET_MAX_LENGTH}
                    onChange={e => onChange(prev => ({ ...prev, text: e.target.value }))}
                    minHeight="15rem"
                />
                {showPageNumber && (
                    <Input
                        type="text"
                        label={t('translationExample.snippet.pageNumber')}
                        value={snippet.pageNumber || ''}
                        onChange={e =>
                            onChange(prev => ({
                                ...prev,
                                pageNumber: e.target.value,
                            }))
                        }
                    />
                )}
            </InputContainer>
        </div>
    );
}

function AddContentSection({
    translationLang,
    termLang,
    description,
    originalHeading,
    originalColumn,
    translatedHeading,
    translatedColumn,
}: {
    translationLang: Lang;
    termLang: Lang;
    description?: React.ReactNode;
    originalHeading: React.ReactNode;
    originalColumn: React.ReactNode;
    translatedHeading: React.ReactNode;
    translatedColumn: React.ReactNode;
}) {
    return (
        <>
            {/* {description && <p className={s.sourceDescription}>{description}</p>} */}

            <Columns>
                <div className={getDominantLanguageClass(termLang)}>
                    <h3 className={s.inputFieldHeading}>{originalHeading}</h3>
                    {originalColumn}
                </div>
                <div className={getDominantLanguageClass(translationLang)}>
                    <h3 className={s.inputFieldHeading}>{translatedHeading}</h3>
                    {translatedColumn}
                </div>
            </Columns>
        </>
    );
}

function Heading({ children }: { children: React.ReactNode }) {
    return <h2 className={s.sectionHeading}>{children}</h2>;
}
