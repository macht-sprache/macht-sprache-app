import { useEffect, useState } from 'react';
import Button from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { findBooks } from '../functions';
import { Book, Lang } from '../types';

type Props = {
    label: string;
    lang: Lang;
    onSelect?: (book: Book | undefined) => void;
    selectedBook?: Book;
};

export default function BookSearch({ label, lang, onSelect = () => {}, selectedBook }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Book[]>([]);

    useEffect(() => {
        if (!query) {
            setResults([]);
        } else {
            let currentRequest = true;
            const timeoutId = window.setTimeout(() => {
                findBooks(query, lang).then(({ data }) => {
                    if (currentRequest) {
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
            <div>
                {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt="" title={selectedBook.title} />
                ) : (
                    selectedBook.title
                )}
                <Button
                    onClick={() => {
                        onSelect(undefined);
                    }}
                >
                    Select different Book
                </Button>
            </div>
        );
    }

    return (
        <div>
            <InputContainer>
                <Input label={label} value={query} onChange={event => setQuery(event.target.value)} />
            </InputContainer>
            <ul>
                {results.map(book => (
                    <li key={book.id}>
                        <button
                            onClick={() => {
                                onSelect(book);
                            }}
                        >
                            {book.coverUrl ? <img src={book.coverUrl} alt="" title={book.title} /> : book.title}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
