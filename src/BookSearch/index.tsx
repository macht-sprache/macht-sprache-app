import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BookCoverIcon } from '../BookCoverIcon';
import Button from '../Form/Button';
import { findBooks } from '../functions';
import MediaSearch, { SelectedItemProps } from '../MediaSearch';
import { Book, Lang } from '../types';
import s from './style.module.css';

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

function SelectedBook({ item: selectedBook, onCancel }: SelectedItemProps<Book>) {
    const { t } = useTranslation();
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (selectedBook) {
            cancelButtonRef.current?.focus();
        }
    }, [selectedBook]);

    return (
        <div className={s.selected}>
            <BookCoverIcon item={selectedBook} />
            <div className={s.selectedMeta}>
                <div>{selectedBook.authors.join(', ')}</div>
                <h3 lang={selectedBook.lang} className={s.selectedHeading}>
                    {selectedBook.title}
                </h3>
                <div className={s.selectedMetaBottom}>
                    {selectedBook.publisher &&
                        t('translationExample.publishedBy', { publisher: selectedBook.publisher })}{' '}
                    in {selectedBook.year}
                    <br />
                    ISBN: {selectedBook.isbn}
                    <br />
                    <div className={s.selectedCancelButtonInline}>
                        <Button onClick={onCancel} size="small" ref={cancelButtonRef}>
                            {t('mediaSearch.books.cancelSelection')}
                        </Button>
                    </div>
                </div>
            </div>
            <button
                className={s.selectedCancelButton}
                onClick={onCancel}
                title={t('mediaSearch.books.cancelSelection')}
                aria-hidden="true"
                tabIndex={-1}
            ></button>
        </div>
    );
}
