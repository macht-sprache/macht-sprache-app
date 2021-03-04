import { useTranslation } from 'react-i18next';
import { findMovies } from '../../functions';
import { MovieCoverIcon } from '../../CoverIcon/MovieCoverIcon';
import { Lang, Movie } from '../../types';
import MediaSearch, { SelectedItemProps } from '../MediaSearch';
import SelectedItem from '../SelectedItem';

type Props = {
    label: string;
    lang: Lang;
    onSelect: (movie: Movie | undefined) => void;
    selectedMovie?: Movie;
};

export default function MovieSearch({ label, lang, selectedMovie, onSelect }: Props) {
    return (
        <MediaSearch
            label={label}
            lang={lang}
            searchFn={findMovies}
            coverComponent={MovieCoverIcon}
            selectedItem={selectedMovie}
            onSelect={onSelect}
            selectedComponent={SelectedMovie}
        />
    );
}
function SelectedMovie(props: SelectedItemProps<Movie>) {
    const { item: movie } = props;
    const { t } = useTranslation();

    return (
        <SelectedItem
            {...props}
            coverComponent={MovieCoverIcon}
            surTitle={movie.directors?.join(', ')}
            metaInfo={<>{movie.year}</>}
            cancelLabel={t('mediaSearch.movies.cancelSelection')}
        />
    );
}
