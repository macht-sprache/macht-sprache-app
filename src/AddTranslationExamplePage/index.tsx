import { Dispatch, SetStateAction, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { SNIPPET_MAX_LENGTH } from '../constants';
import Button, { ButtonContainer } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { addTranslationExample } from '../functions';
import Header from '../Header';
import { collections } from '../hooks/data';
import { Get, useDocument } from '../hooks/fetch';
import { ColumnHeading, Columns, FullWidthColumn } from '../Layout/Columns';
import BookSearch from '../MediaSelection/BookSearch';
import MovieSearch from '../MediaSelection/MovieSearch';
import WebPageSearch from '../MediaSelection/WebPageSearch';
import { TranslationExampleModel } from '../modelTypes';
import { Redact } from '../RedactSensitiveTerms';
import { TERM, TRANSLATION_EXAMPLE } from '../routes';
import SavingState from '../SavingState';
import SidebarTermRedirectWrapper from '../SidebarTermRedirectWrapper';
import { TermWithLang } from '../TermWithLang';
import { SourceMediaForType, SourceType, Term, Translation } from '../types';
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
        <>
            <Header
                mainLang={translation.lang}
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: <Redact>{term.value}</Redact>,
                        lang: term.lang,
                    },
                ]}
                subLine={
                    <Trans
                        t={t}
                        i18nKey="translationExample.add"
                        components={{
                            Term: <TermWithLang term={term} />,
                            Translation: <TermWithLang term={translation} />,
                        }}
                    />
                }
            >
                <Redact>{translation.value}</Redact>
            </Header>

            {saving ? (
                <SavingState />
            ) : (
                <>
                    <FullWidthColumn>
                        <ColumnHeading>{t('translationExample.steps.type.label')}</ColumnHeading>
                        <SelectType {...stepProps} />
                    </FullWidthColumn>
                    {!!model.type && (
                        <>
                            <FullWidthColumn>
                                <ColumnHeading>{t('translationExample.steps.source.label')}</ColumnHeading>
                                <SelectMedia {...stepProps} />{' '}
                            </FullWidthColumn>
                            <FullWidthColumn>
                                <ColumnHeading>{t('translationExample.steps.example.label')}</ColumnHeading>
                                <AddSnippet {...stepProps} />{' '}
                            </FullWidthColumn>
                        </>
                    )}

                    {error && <ErrorBox>{t('common.error.general')}</ErrorBox>}

                    {!!model.type && (
                        <ButtonContainer>
                            <Button primary onClick={save} disabled={!isValid}>
                                {t('common.formNav.save')}
                            </Button>
                        </ButtonContainer>
                    )}
                </>
            )}
        </>
    );
}

function SelectType({ model, onChange }: StepProps) {
    const { t } = useTranslation();
    return (
        <>
            <p>{t('translationExample.steps.type.description')}</p>
            <TypeSelectorContainer
                name="type"
                value={model.type}
                onChange={type => onChange(() => ({ original: {}, translated: {}, type }))}
            >
                <TypeSelector value="BOOK" label={t('translationExample.types.BOOK')} />
                <TypeSelector value="WEBPAGE" label={t('translationExample.types.WEBSITE')} />
                <TypeSelector value="MOVIE" label={t('translationExample.types.MOVIE')} />
                <TypeSelector value="OTHER" label={t('translationExample.types.OTHER')} disabled />
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
        <>
            <p>{t('translationExample.source.BOOK.description')}</p>

            <Columns>
                <div>
                    <h3 className={s.mediaSearchHeading}>{t('translationExample.source.BOOK.titleOriginal')}</h3>
                    <BookSearch
                        label={t('translationExample.source.BOOK.searchOriginal')}
                        lang={term.lang}
                        selectedBook={model.original.sourceMedium}
                        onSelect={sourceMedium =>
                            onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                        }
                    />
                </div>
                <div>
                    <h3 className={s.mediaSearchHeading}>{t('translationExample.source.BOOK.titleTranslated')}</h3>
                    <BookSearch
                        label={t('translationExample.source.BOOK.searchTranslation')}
                        lang={translation.lang}
                        selectedBook={model.translated.sourceMedium}
                        onSelect={sourceMedium =>
                            onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                        }
                    />
                </div>
            </Columns>
        </>
    );
}

function MovieSelection({ term, translation, model, onChange }: StepProps<'MOVIE'>) {
    const { t } = useTranslation();

    return (
        <>
            <p>{t('translationExample.source.MOVIE.description')}</p>
            <Columns>
                <div>
                    <h3 className={s.mediaSearchHeading}>{t('translationExample.source.MOVIE.titleOriginal')}</h3>
                    <MovieSearch
                        label={t('translationExample.source.MOVIE.searchOriginal')}
                        lang={term.lang}
                        selectedMovie={model.original.sourceMedium}
                        onSelect={sourceMedium =>
                            onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                        }
                    />
                </div>
                <div>
                    <h3 className={s.mediaSearchHeading}>{t('translationExample.source.MOVIE.titleTranslated')}</h3>
                    <MovieSearch
                        label={t('translationExample.source.MOVIE.searchTranslation')}
                        lang={translation.lang}
                        selectedMovie={model.translated.sourceMedium}
                        onSelect={sourceMedium =>
                            onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                        }
                    />
                </div>
            </Columns>
        </>
    );
}

function WebPageSelection({ term, translation, model, onChange }: StepProps<'WEBPAGE'>) {
    const { t } = useTranslation();

    return (
        <>
            <p>{t('translationExample.source.WEBPAGE.description')}</p>
            <Columns>
                <div>
                    <h3 className={s.mediaSearchHeading}>{t('translationExample.source.WEBPAGE.titleOriginal')}</h3>
                    <WebPageSearch
                        label={t('translationExample.source.WEBPAGE.searchOriginal')}
                        lang={term.lang}
                        selectedPage={model.original.sourceMedium}
                        onSelect={sourceMedium =>
                            onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                        }
                    />
                </div>
                <div>
                    <h3 className={s.mediaSearchHeading}>{t('translationExample.source.WEBPAGE.titleTranslated')}</h3>
                    <WebPageSearch
                        label={t('translationExample.source.WEBPAGE.searchTranslation')}
                        lang={translation.lang}
                        selectedPage={model.translated.sourceMedium}
                        onSelect={sourceMedium =>
                            onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                        }
                    />
                </div>
            </Columns>
        </>
    );
}

function AddSnippet({ term, translation, model, onChange }: StepProps) {
    return (
        <>
            <Columns>
                <SnippetSelection
                    term={term}
                    showPageNumber={model.type === 'BOOK'}
                    snippet={model.original}
                    onChange={updater => onChange(prev => ({ ...prev, original: updater(prev.original) }))}
                />
                <SnippetSelection
                    term={translation}
                    showPageNumber={model.type === 'BOOK'}
                    snippet={model.translated}
                    onChange={updater => onChange(prev => ({ ...prev, translated: updater(prev.translated) }))}
                />
            </Columns>
        </>
    );
}

function SnippetSelection({
    term,
    showPageNumber,
    snippet,
    onChange,
}: {
    term: Term | Translation;
    showPageNumber?: boolean;
    snippet: SnippetModel;
    onChange: (updater: (prev: SnippetModel) => SnippetModel) => void;
}) {
    const { t } = useTranslation();
    return (
        <div>
            <p>
                <Trans
                    i18nKey="translationExample.snippet.description"
                    values={{ title: snippet.sourceMedium?.title }}
                    components={{ Term: <TermWithLang term={term} />, Title: <em /> }}
                />
            </p>
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
