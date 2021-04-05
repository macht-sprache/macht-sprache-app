import { Dispatch, SetStateAction, useState } from 'react';
import { TFunction, Trans, useTranslation } from 'react-i18next';
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
import { Columns } from '../Layout/Columns';
import BookSearch from '../MediaSelection/BookSearch';
import MovieSearch from '../MediaSelection/MovieSearch';
import WebPageSearch from '../MediaSelection/WebPageSearch';
import { TranslationExampleModel } from '../modelTypes';
import { MultiStepIndicator, MultiStepIndicatorStep } from '../MultiStepIndicator';
import { Redact } from '../RedactSensitiveTerms';
import { TERM, TRANSLATION_EXAMPLE } from '../routes';
import SavingState from '../SavingState';
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
    t: TFunction;
    model: Model<T>;
    term: Term;
    translation: Translation;
    onChange: Dispatch<SetStateAction<Model<T>>>;
};

type Step = {
    label: (t: TFunction) => React.ReactNode;
    body: (props: StepProps) => React.ReactNode;
    valid: (model: Model) => boolean;
};

const steps: Step[] = [
    {
        label: t => t('translationExample.steps.type.label'),
        body: ({ t, model, onChange }) => (
            <Section>
                <p>{t('translationExample.steps.type.description')}</p>
                <TypeSelectorContainer
                    name="type"
                    value={model.type}
                    onChange={type => onChange(prev => ({ ...prev, type }))}
                >
                    <TypeSelector value="BOOK" label={t('translationExample.types.BOOK')} />
                    <TypeSelector value="WEBPAGE" label={t('translationExample.types.WEBSITE')} />
                    <TypeSelector value="MOVIE" label={t('translationExample.types.MOVIE')} />
                    <TypeSelector value="OTHER" label={t('translationExample.types.OTHER')} disabled />
                </TypeSelectorContainer>
            </Section>
        ),
        valid: model => !!model.type,
    },
    {
        label: t => t('translationExample.steps.source.label'),
        body: props => {
            switch (props.model.type) {
                case 'BOOK':
                    return <BookSelection {...(props as StepProps<'BOOK'>)} />;
                case 'MOVIE':
                    return <MovieSelection {...(props as StepProps<'MOVIE'>)} />;
                case 'WEBPAGE':
                    return <WebPageSelection {...(props as StepProps<'WEBPAGE'>)} />;
            }
        },
        valid: model => !!(model.original.sourceMedium && model.translated.sourceMedium),
    },
    {
        label: t => t('translationExample.steps.example.label'),
        body: ({ term, translation, model, onChange }) => (
            <Section>
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
            </Section>
        ),
        valid: model => !!(model.original.text && model.translated.text),
    },
];

const getNextStep = (step: Step) => steps[steps.indexOf(step) + 1];

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

function BookSelection({ t, term, translation, model, onChange }: StepProps<'BOOK'>) {
    return (
        <>
            <p>{t('translationExample.source.BOOK.description')}</p>
            <Section>
                <h3 className={s.mediaSearchHeading}>{t('translationExample.source.BOOK.titleOriginal')}</h3>
                <BookSearch
                    label={t('translationExample.source.BOOK.searchOriginal')}
                    lang={term.lang}
                    selectedBook={model.original.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                    }
                />
            </Section>
            <Section>
                <h3 className={s.mediaSearchHeading}>{t('translationExample.source.BOOK.titleTranslated')}</h3>
                <BookSearch
                    label={t('translationExample.source.BOOK.searchTranslation')}
                    lang={translation.lang}
                    selectedBook={model.translated.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                    }
                />
            </Section>
        </>
    );
}

function MovieSelection({ t, term, translation, model, onChange }: StepProps<'MOVIE'>) {
    return (
        <>
            <p>{t('translationExample.source.MOVIE.description')}</p>
            <Section>
                <h3 className={s.mediaSearchHeading}>{t('translationExample.source.MOVIE.titleOriginal')}</h3>
                <MovieSearch
                    label={t('translationExample.source.MOVIE.searchOriginal')}
                    lang={term.lang}
                    selectedMovie={model.original.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                    }
                />
            </Section>
            <Section>
                <h3 className={s.mediaSearchHeading}>{t('translationExample.source.MOVIE.titleTranslated')}</h3>
                <MovieSearch
                    label={t('translationExample.source.MOVIE.searchTranslation')}
                    lang={translation.lang}
                    selectedMovie={model.translated.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                    }
                />
            </Section>
        </>
    );
}

function WebPageSelection({ t, term, translation, model, onChange }: StepProps<'WEBPAGE'>) {
    return (
        <>
            <p>{t('translationExample.source.WEBPAGE.description')}</p>
            <Section>
                <h3 className={s.mediaSearchHeading}>{t('translationExample.source.WEBPAGE.titleOriginal')}</h3>
                <WebPageSearch
                    label={t('translationExample.source.WEBPAGE.searchOriginal')}
                    lang={term.lang}
                    selectedPage={model.original.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                    }
                />
            </Section>
            <Section>
                <h3 className={s.mediaSearchHeading}>{t('translationExample.source.WEBPAGE.titleTranslated')}</h3>
                <WebPageSearch
                    label={t('translationExample.source.WEBPAGE.searchTranslation')}
                    lang={translation.lang}
                    selectedPage={model.translated.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, translated: { ...prev.translated, sourceMedium } }))
                    }
                />
            </Section>
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

function AddTranslationExample({ getTerm, getTranslation }: { getTerm: Get<Term>; getTranslation: Get<Translation> }) {
    const { t } = useTranslation();
    const history = useHistory();
    const [step, setStep] = useState(steps[0]);
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
    const goToNext = () => setStep(getNextStep);
    const isLastStep = steps.indexOf(step) === steps.length - 1;

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
            >
                <Redact>{translation.value}</Redact>
            </Header>
            <p>
                <Trans
                    t={t}
                    i18nKey="translationExample.add"
                    components={{
                        Term: <TermWithLang term={term} />,
                        Translation: <TermWithLang term={translation} />,
                    }}
                />
            </p>

            {saving ? (
                <SavingState />
            ) : (
                <>
                    <MultiStepIndicator>
                        {steps.map((currentStep, index) => (
                            <MultiStepIndicatorStep key={index} active={currentStep === step}>
                                {currentStep.label(t)}
                            </MultiStepIndicatorStep>
                        ))}
                    </MultiStepIndicator>
                    <div className={s.steps}>
                        {step.body({ t, term, translation, model, onChange })}
                        {error && <ErrorBox>{t('common.error.general')}</ErrorBox>}
                        <ButtonContainer>
                            <Button primary onClick={isLastStep ? save : goToNext} disabled={!step.valid(model)}>
                                {isLastStep ? t('common.formNav.save') : t('common.formNav.next')}
                            </Button>
                        </ButtonContainer>
                    </div>
                </>
            )}
        </>
    );
}

export default function AddTranslationExamplePage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const getTerm = useDocument(collections.terms.doc(termId));
    const getTranslation = useDocument(collections.translations.doc(translationId));

    return <AddTranslationExample getTerm={getTerm} getTranslation={getTranslation} />;
}

const Section = ({ children }: { children: React.ReactNode }) => <div className={s.section}>{children}</div>;
