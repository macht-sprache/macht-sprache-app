import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookCoverIcon } from '../BookCoverIcon';
import Button from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { findBooks } from '../functions';
import { Book, Lang } from '../types';
import { useDomId } from '../useDomId';
import s from './style.module.css';

type Props = {
    label: string;
    lang: Lang;
    onSelect?: (book: Book | undefined) => void;
    selectedBook?: Book;
};

export default function BookSearch({ label, lang, onSelect = () => {}, selectedBook }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Book[]>([]);
    const [searching, setSearching] = useState<boolean>();
    const id = useDomId();
    const [ariaSelectedIndex, setAriaSelectedIndex] = useState<number>(0);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const { t } = useTranslation();

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (ariaSelectedIndex < results.length - 1) {
                    setAriaSelectedIndex(prevIndex => prevIndex + 1);
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (ariaSelectedIndex !== 0) {
                    setAriaSelectedIndex(prevIndex => prevIndex - 1);
                }
            }
            if (e.key === 'Enter') {
                onSelect(results[ariaSelectedIndex]);
            }
        },
        [ariaSelectedIndex, onSelect, results]
    );

    useEffect(() => {
        if (!query) {
            setResults([]);
            setSearching(false);
        } else {
            let currentRequest = true;
            setSearching(true);
            const timeoutId = window.setTimeout(() => {
                findBooks(query, lang).then(({ data }) => {
                    if (currentRequest) {
                        setAriaSelectedIndex(0);
                        setSearching(false);
                        setResults(data);
                    }
                });
            }, 500);
            return () => {
                window.clearTimeout(timeoutId);
                currentRequest = false;
            };
        }
    }, [lang, query]);

    useEffect(() => {
        if (selectedBook) {
            cancelButtonRef.current?.focus();
        }
    }, [selectedBook]);

    if (selectedBook) {
        return (
            <div className={s.selected}>
                <BookCoverIcon book={selectedBook} lang={lang} />
                <div className={s.selectedMeta}>
                    <div>{selectedBook.authors.join(', ')}</div>
                    <h3 lang={lang} className={s.selectedHeading}>
                        {selectedBook.title}
                    </h3>
                    <div className={s.selectedMetaBottom}>
                        {selectedBook.publisher &&
                            t('translationExample.publishedBy', { publisher: selectedBook.publisher })}{' '}
                        in {selectedBook.year}
                        <br />
                        ISBN: {selectedBook.isbn}
                        <br />
                        <div className={s.selectedCancelButtonInline}>
                            <Button
                                onClick={() => {
                                    onSelect(undefined);
                                }}
                                size="small"
                                ref={cancelButtonRef}
                            >
                                {t('translationExample.bookSearch.cancelSelection')}
                            </Button>
                        </div>
                    </div>
                </div>
                <button
                    className={s.selectedCancelButton}
                    onClick={() => {
                        onSelect(undefined);
                    }}
                    title={t('translationExample.bookSearch.cancelSelection')}
                    aria-hidden="true"
                    tabIndex={-1}
                ></button>
            </div>
        );
    }

    return (
        <div>
            <InputContainer>
                <Input
                    label={label}
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    busy={searching}
                    aria-describedby={id('resultListDescription')}
                    aria-owns={id('resultList')}
                    aria-expanded={!!results.length}
                    aria-autocomplete="both"
                    aria-activedescendant={id('result-' + ariaSelectedIndex)}
                    onKeyDown={onKeyDown}
                />
            </InputContainer>
            <div id={id('resultListDescription')} className={s.ariaInputDescription}>
                {!results.length && <>{t('translationExample.bookSearch.ariaNoResults')}</>}
                {t('translationExample.bookSearch.ariaDescription')}
            </div>
            {!!results.length && (
                <ul className={s.resultList} id={id('resultList')} role="listbox">
                    {results.map((book, index) => (
                        <li
                            key={book.id}
                            className={clsx(s.resultItem, { [s.ariaSelected]: ariaSelectedIndex === index })}
                            lang={lang}
                        >
                            <button
                                onClick={() => {
                                    onSelect(book);
                                }}
                                className={s.resultButton}
                                lang={lang}
                                role="option"
                                aria-selected={ariaSelectedIndex === index}
                                id={id('result-' + index)}
                            >
                                <BookCoverIcon book={book} className={s.resultButtonIcon} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!results.length && !!query && <div className={s.noResults}>no results</div>}
        </div>
    );
}
