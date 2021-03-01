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
import { useTerm, useTranslationEntity } from '../hooks/data';
import { Columns } from '../Layout/Columns';
import BookSearch from '../MediaSelection/BookSearch';
import { TranslationExampleModel } from '../modelTypes';
import { MultiStepIndicator, MultiStepIndicatorStep } from '../MultiStepIndicator';
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
                    <TypeSelector value="WEBPAGE" label={t('translationExample.types.WEBSITE')} disabled />
                    <TypeSelector value="MOVIE" label={t('translationExample.types.MOVIE')} disabled />
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
            <p>{t('translationExample.steps.source.description')}</p>
            <Section>
                <h3 className={s.bookSearchHeading}>{t('translationExample.steps.source.bookOriginalTitle')}</h3>
                <BookSearch
                    label={t('translationExample.steps.source.bookSearchOriginal')}
                    lang={term.lang}
                    selectedBook={model.original.sourceMedium}
                    onSelect={sourceMedium =>
                        onChange(prev => ({ ...prev, original: { ...prev.original, sourceMedium } }))
                    }
                />
            </Section>
            <Section>
                <h3 className={s.bookSearchHeading}>{t('translationExample.steps.source.bookTranslatedTitle')}</h3>
                <BookSearch
                    label={t('translationExample.steps.source.bookSearchTranslation')}
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

function AddTranslationExample({ term, translation }: { term: Term; translation: Translation }) {
    const { t } = useTranslation();
    const history = useHistory();
    const [step, setStep] = useState(steps[0]);
    const [model, onChange] = useState<Model>({ original: {}, translated: {} });
    const [{ saving, error }, setSaveState] = useState({ saving: false, error: false });

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
                        inner: term.value,
                        lang: term.lang,
                    },
                ]}
            >
                {translation.value}
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

export function AddTranslationExamplePage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);

    return <AddTranslationExample term={term} translation={translation} />;
}

const Section = ({ children }: { children: React.ReactNode }) => <div className={s.section}>{children}</div>;
