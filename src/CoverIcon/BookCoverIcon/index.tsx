import clsx from 'clsx';
import { Book } from '../../types';
import s from './style.module.css';

type BookCoverIconProps = {
    item: Book;
    className?: string;
};

export function BookCoverIcon({ item: book, className }: BookCoverIconProps) {
    return (
        <div className={clsx(s.container, className)} lang={book.lang}>
            {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} title={book.title} className={s.cover} />
            ) : (
                <span className={s.fallback}>{book.title}</span>
            )}
        </div>
    );
}
