import { useTranslation } from 'react-i18next';
import { BookCoverIcon } from '../../BookCoverIcon';
import { findBooks } from '../../functions';
import { Book, Lang } from '../../types';
import MediaSearch, { SelectedItemProps } from '../MediaSearch';
import SelectedItem from '../SelectedItem';

type Props = {
    label: string;
    lang: Lang;
    onSelect?: (book: Book | undefined) => void;
    selectedBook?: Book;
};

export default function BookSearch({ label, lang, onSelect = () => {}, selectedBook }: Props) {
    return (
        <MediaSearch
            label={label}
            lang={lang}
            searchFn={findBooks}
            coverComponent={BookCoverIcon}
            selectedItem={selectedBook}
            onSelect={onSelect}
            selectedComponent={SelectedBook}
        />
    );
}

function SelectedBook(props: SelectedItemProps<Book>) {
    const { item: book } = props;
    const { t } = useTranslation();

    return (
        <SelectedItem
            {...props}
            coverComponent={BookCoverIcon}
            surTitle={book.authors.join(', ')}
            metaInfo={
                <>
                    {book.publisher && t('translationExample.publishedBy', { publisher: book.publisher })} in{' '}
                    {book.year}
                    <br />
                    ISBN: {book.isbn}
                </>
            }
            cancelLabel={t('mediaSearch.books.cancelSelection')}
        />
    );
}
