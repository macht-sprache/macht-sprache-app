import clsx from 'clsx';
import { Movie } from '../../../types';
import s from './style.module.css';

type Props = {
    item: Movie;
    className?: string;
};

export function MovieCoverIcon({ item: movie, className }: Props) {
    return (
        <div className={clsx(s.container, className)} lang={movie.lang}>
            {movie.coverUrl ? (
                <img src={movie.coverUrl} alt={movie.title} title={movie.title} className={s.cover} />
            ) : (
                <span className={s.fallback}>{movie.title}</span>
            )}
        </div>
    );
}
