import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link, useHistory, useParams } from 'react-router-dom';
import Button, { ButtonContainer } from '../Form/Button';
import Header from '../Header';
import { useTerm, useTranslationEntity } from '../hooks/data';
import { MultiStepIndicator, MultiStepIndicatorStep } from '../MultiStepIndicator';
import { TERM, TRANSLATION } from '../routes';
import { TermWithLang } from '../TermWithLang';
import s from './style.module.css';
import BookSearch from '../BookSearch';
import { Book } from '../types';
import { Columns } from '../Layout/Columns';
import InputContainer from '../Form/InputContainer';
import { Input, Textarea } from '../Form/Input';
import { addTranslationExample } from '../functions';
import SavingState from '../SavingState';
import { TypeSelector, TypeSelectorContainer } from './TypeSelector';

export function AddTranslationExamplePage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const history = useHistory();
    const translation = useTranslationEntity(translationId);
    const { t } = useTranslation();
    const [step, setStep] = useState<number>(0);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [type, setType] = useState<'BOOK'>();
    const [originalBook, setOriginalBook] = useState<Book | undefined>();
    const [translatedBook, setTranslatedBook] = useState<Book | undefined>();

    const [snippets, setSnippets] = useState<{
        original: string;
        originalPageNo?: string;
        translated: string;
        translatedPageNo?: string;
    }>({ original: '', originalPageNo: '', translated: '', translatedPageNo: '' });

    const incrementStep = () => {
        setStep(step + 1);
    };

    const save = () => {
        if (originalBook && translatedBook) {
            setSubmitting(true);

            addTranslationExample({
                termId,
                translationId,
                original: {
                    type: 'BOOK',
                    text: snippets.original,
                    pageNumber: snippets.originalPageNo,
                    bookId: originalBook.id,
                },
                translated: {
                    type: 'BOOK',
                    text: snippets.translated,
                    pageNumber: snippets.translatedPageNo,
                    bookId: translatedBook.id,
                },
            }).then(() => {
                setSubmitting(false);
                history.push(generatePath(TRANSLATION, { termId, translationId }));
            });
        } else {
            console.log("books aren't set. should not be possible. what happened?!");
        }
    };

    const steps = [
        {
            label: t('translationExample.steps.type.label'),
            body: (
                <>
                    <Section>
                        <p>{t('translationExample.steps.type.description')}</p>
                        <TypeSelectorContainer>
                            <TypeSelector
                                name="type"
                                value="BOOK"
                                onChange={el => {
                                    setType(el.target.value as 'BOOK');
                                }}
                                label={t('translationExample.types.BOOK')}
                            />
                            <TypeSelector
                                name="type"
                                value="WEBSITE"
                                label={t('translationExample.types.WEBSITE')}
                                disabled
                            />
                            <TypeSelector
                                name="type"
                                value="NEWSPAPER"
                                label={t('translationExample.types.NEWSPAPER')}
                                disabled
                            />
                            <TypeSelector
                                name="type"
                                value="MOVIE"
                                label={t('translationExample.types.MOVIE')}
                                disabled
                            />
                            <TypeSelector
                                name="type"
                                value="OTHER"
                                label={t('translationExample.types.OTHER')}
                                disabled
                            />
                        </TypeSelectorContainer>
                    </Section>
                    <ButtonContainer>
                        <Button primary onClick={incrementStep} disabled={!type}>
                            Next
                        </Button>
                    </ButtonContainer>
                </>
            ),
        },
        {
            label: t('translationExample.steps.source.label'),
            body: (
                <>
                    <p>{t('translationExample.steps.source.description')}</p>
                    <Section>
                        <h3 className={s.bookSearchHeading}>
                            {t('translationExample.steps.source.bookOriginalTitle')}
                        </h3>
                        <BookSearch
                            label={t('translationExample.steps.source.bookSearchOriginal')}
                            lang={term.lang}
                            selectedBook={originalBook}
                            onSelect={setOriginalBook}
                        />
                    </Section>
                    <Section>
                        <h3 className={s.bookSearchHeading}>
                            {t('translationExample.steps.source.bookTranslatedTitle')}
                        </h3>
                        <BookSearch
                            label={t('translationExample.steps.source.bookSearchTranslation')}
                            lang={translation.lang}
                            selectedBook={translatedBook}
                            onSelect={setTranslatedBook}
                        />
                    </Section>
                    <ButtonContainer>
                        <Button primary onClick={incrementStep} disabled={!(originalBook && translatedBook)}>
                            Next
                        </Button>
                    </ButtonContainer>
                </>
            ),
        },
        {
            label: t('translationExample.steps.example.label'),
            body: (
                <>
                    <Section>
                        <Columns>
                            <div>
                                <p>
                                    <Trans
                                        i18nKey="translationExample.snippet.description"
                                        values={{ book: originalBook?.title }}
                                        components={{ Term: <TermWithLang term={term} />, Book: <em /> }}
                                    />
                                </p>
                                <InputContainer>
                                    <Textarea
                                        label={t('translationExample.snippet.label')}
                                        value={snippets?.original}
                                        onChange={e =>
                                            setSnippets(prevProps => ({ ...prevProps, original: e.target.value }))
                                        }
                                    />
                                    <Input
                                        type="text"
                                        label={t('translationExample.snippet.pageNumber')}
                                        value={snippets?.originalPageNo}
                                        onChange={e =>
                                            setSnippets(prevProps => ({ ...prevProps, originalPageNo: e.target.value }))
                                        }
                                    />
                                </InputContainer>
                            </div>
                            <div>
                                <p>
                                    <Trans
                                        i18nKey="translationExample.snippet.description"
                                        values={{ book: translatedBook?.title }}
                                        components={{ Term: <TermWithLang term={translation} />, Book: <em /> }}
                                    />
                                </p>
                                <InputContainer>
                                    <Textarea
                                        label={t('translationExample.snippet.label')}
                                        value={snippets?.translated}
                                        onChange={e =>
                                            setSnippets(prevProps => ({ ...prevProps, translated: e.target.value }))
                                        }
                                    />
                                    <Input
                                        type="text"
                                        label={t('translationExample.snippet.pageNumber')}
                                        value={snippets?.translatedPageNo}
                                        onChange={e =>
                                            setSnippets(prevProps => ({
                                                ...prevProps,
                                                translatedPageNo: e.target.value,
                                            }))
                                        }
                                    />
                                </InputContainer>
                            </div>
                        </Columns>
                    </Section>
                    <ButtonContainer>
                        <Button primary onClick={save}>
                            Save
                        </Button>
                    </ButtonContainer>
                </>
            ),
        },
    ];

    return (
        <>
            <Header
                mainLang={translation.lang}
                subHeading={
                    <Link lang={term.lang} className={s.termLink} to={generatePath(TERM, { termId: term.id })}>
                        {term.value}
                    </Link>
                }
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
            {submitting ? (
                <SavingState />
            ) : (
                <>
                    <MultiStepIndicator>
                        {steps.map(({ label }, index) => (
                            <MultiStepIndicatorStep key={index} active={index === step}>
                                {label}
                            </MultiStepIndicatorStep>
                        ))}
                    </MultiStepIndicator>
                    <div className={s.steps}>{steps[step].body}</div>
                </>
            )}
        </>
    );
}

const Section = ({ children }: { children: React.ReactNode }) => <div className={s.section}>{children}</div>;
