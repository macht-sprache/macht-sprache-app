import { useEffect, useState } from 'react';
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
                {selectedBook.coverUrl ? (
                    <img className={s.selectedImage} src={selectedBook.coverUrl} alt="" title={selectedBook.title} />
                ) : (
                    selectedBook.title
                )}
                <button
                    className={s.selectedCancelButton}
                    onClick={() => {
                        onSelect(undefined);
                    }}
                    title={'Select different Book'}
                    aria-label="Select different Book"
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
