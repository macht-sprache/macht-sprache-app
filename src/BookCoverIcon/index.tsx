import clsx from 'clsx';
import { Book, Lang } from '../types';
import s from './style.module.css';

type BookCoverIconProps = {
    book: Book;
    lang?: Lang;
    className?: string;
};

export function BookCoverIcon({ book, className, lang }: BookCoverIconProps) {
    return (
        <div className={clsx(s.container, className)} lang={lang}>
            {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className={s.cover} />
            ) : (
                <span className={s.fallback}>{book.title}</span>
            )}
        </div>
    );
}
