import { useEffect, useState } from 'react';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { findBooks } from '../functions';
import { Book, Lang } from '../types';

type Props = {
    label: string;
    lang: Lang;
};

export default function BookSearch({ label, lang }: Props) {
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

    return (
        <div>
            <InputContainer>
                <Input label={label} value={query} onChange={event => setQuery(event.target.value)} />
            </InputContainer>
            <ul>
                {results.map(book => (
                    <li key={book.id}>
                        {book.coverUrl ? <img src={book.coverUrl} alt="" title={book.title} /> : book.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}
