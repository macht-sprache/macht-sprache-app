import { Source } from '../../types';
import { BookCoverIcon } from './BookCoverIcon';
import { MovieCoverIcon } from './MovieCoverIcon';
import { WebsiteCoverIcon } from './WebsiteCoverIcon';

type WebsiteCoverIconProps = {
    item?: Source;
    className?: string;
};

export function CoverIcon({ item, className }: WebsiteCoverIconProps) {
    if (item?.type === 'BOOK') {
        return <BookCoverIcon item={item} className={className} />;
    }
    if (item?.type === 'MOVIE') {
        return <MovieCoverIcon item={item} className={className} />;
    }
    if (item?.type === 'WEBPAGE') {
        return <WebsiteCoverIcon item={item} className={className} />;
    }
    return null;
}
