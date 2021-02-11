import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { findBooks } from '../functions';
import { Book, Lang } from '../types';
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
    const { t } = useTranslation();

    useEffect(() => {
        if (!query) {
            setResults([]);
        } else {
            let currentRequest = true;
            setSearching(true);
            const timeoutId = window.setTimeout(() => {
                findBooks(query, lang).then(({ data }) => {
                    if (currentRequest) {
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

    if (selectedBook) {
        return (
            <div className={s.selected}>
                <div className={s.selectedCover}>
                    {selectedBook.coverUrl ? (
                        <img
                            className={s.selectedImage}
                            src={selectedBook.coverUrl}
                            alt=""
                            title={selectedBook.title}
                        />
                    ) : (
                        selectedBook.title
                    )}
                </div>
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
                    </div>
                </div>
                <button
                    className={s.selectedCancelButton}
                    onClick={() => {
                        onSelect(undefined);
                    }}
                    title={t('translationExample.bookSearch.cancelSelection')}
                    aria-label={t('translationExample.bookSearch.cancelSelection')}
                ></button>
            </div>
        );
    }

    return (
        <div>
            <InputContainer>
                <Input label={label} value={query} onChange={event => setQuery(event.target.value)} busy={searching} />
            </InputContainer>
            {!!results.length && (
                <ul className={s.resultList}>
                    {results.map(book => (
                        <li key={book.id} className={s.resultItem}>
                            <button
                                onClick={() => {
                                    onSelect(book);
                                }}
                                className={s.resultButton}
                                title={book.title}
                            >
                                {book.coverUrl ? (
                                    <img className={s.resultImage} src={book.coverUrl} alt="" title={book.title} />
                                ) : (
                                    book.title
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!results.length && !!query && <div className={s.noResults}>no results</div>}
        </div>
    );
}
