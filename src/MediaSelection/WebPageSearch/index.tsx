import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import { FormatDate } from '../../FormatDate';
import { findWebPage } from '../../functions';
import { Lang, WebPage } from '../../types';
import SelectedItem from '../SelectedItem';

type Props = {
    label: string;
    lang: Lang;
    selectedPage?: WebPage;
    onSelect: (page: WebPage | undefined) => void;
};

const isValidUrl = (url: string) => {
    try {
        return !!new URL(url);
    } catch {
        return false;
    }
};

type State = {
    url: string;
    searching: boolean;
    error: null | unknown;
};

export default function WebPageSearch({ label, lang, selectedPage, onSelect }: Props) {
    const { t } = useTranslation();
    const [{ url, searching }, setState] = useState<State>({ url: '', searching: false, error: null });
    const isValid = !url || isValidUrl(url);

    useEffect(() => {
        if (url && isValidUrl(url)) {
            setState(prev => ({ ...prev, searching: true, error: null }));
            findWebPage(url, lang).then(
                page => {
                    setState(prev => ({ ...prev, error: null, searching: false }));
                    onSelect(page);
                },
                error => setState(prev => ({ ...prev, searching: false, error }))
            );
        }
    }, [lang, onSelect, url]);

    if (selectedPage) {
        return (
            <SelectedItem
                item={selectedPage}
                onCancel={() => onSelect(undefined)}
                coverComponent={CoverComponent}
                metaInfo={getMeta(selectedPage)}
                cancelLabel={t('mediaSearch.webpage.cancelSelection')}
            />
        );
    }

    return (
        <InputContainer>
            <Input
                label={label}
                value={url}
                onChange={event => setState(prev => ({ ...prev, url: event.target.value }))}
                busy={searching}
                disabled={searching}
                error={isValid ? undefined : 'URL INVALID'}
            />
        </InputContainer>
    );
}

// TODO!
function CoverComponent({ item, className }: { item: WebPage; className?: string }) {
    return item.imageUrl ? <img style={{ maxWidth: '200px' }} src={item.imageUrl} alt={item.title} /> : null;
}

function getMeta(page: WebPage) {
    return (
        <>
            {page.description && (
                <>
                    {page.description}
                    <br />
                </>
            )}
            {page.author && (
                <>
                    {page.author}
                    <br />
                </>
            )}
            {page.publisher && (
                <>
                    {page.publisher}
                    <br />
                </>
            )}
            {page.date && (
                <>
                    <FormatDate date={new Date(page.date)} />
                    <br />
                </>
            )}
        </>
    );
}
