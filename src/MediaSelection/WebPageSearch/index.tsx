import { useCallback, useEffect, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { WebsiteCoverIcon } from '../../CoverIcon/WebsiteCoverIcon';
import Button from '../../Form/Button';
import { Input } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import { FormatDate } from '../../FormatDate';
import { findWebPage } from '../../functions';
import { Lang, WebPage } from '../../types';
import { isValidUrl } from '../../utils';
import SelectedItem from '../SelectedItem';

type Props = {
    label: string;
    lang: Lang;
    selectedPage?: WebPage;
    onSelect: (page: WebPage | undefined) => void;
};

type State = {
    url: string;
    searching: boolean;
    pasted: boolean;
    result: WebPage | null;
    error: null | { code?: string };
};

export default function WebPageSearch({ label, lang, selectedPage, onSelect }: Props) {
    const { t } = useTranslation();
    const [{ url, searching, pasted, result, error }, setState] = useState<State>({
        url: '',
        searching: false,
        pasted: false,
        error: null,
        result: null,
    });

    const search = useCallback(() => {
        if (!url) {
            return;
        }

        if (!isValidUrl(url)) {
            return setState(prev => ({ ...prev, error: { code: 'invalid-url' }, pasted: false }));
        }

        setState(prev => ({ ...prev, searching: true, error: null }));
        findWebPage(url, lang).then(
            page => {
                setState(prev => ({ ...prev, error: null, pasted: false, result: page }));
            },
            error => setState(prev => ({ ...prev, searching: false, pasted: false, error }))
        );
    }, [lang, url]);

    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({
            ...prev,
            error: null,
            url: event.target.value,
            pasted: (event.nativeEvent as InputEvent).inputType === 'insertFromPaste',
        }));
    }, []);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                search();
            }
        },
        [search]
    );

    useEffect(() => {
        if (pasted) {
            search();
        }
    }, [lang, pasted, search, url]);

    useEffect(() => {
        if (result) {
            setState(prev => ({ ...prev, searching: false, result: null }));
            onSelect(result);
        }
    }, [onSelect, result]);

    if (selectedPage) {
        return (
            <SelectedItem
                item={selectedPage}
                onCancel={() => onSelect(undefined)}
                coverComponent={WebsiteCoverIcon}
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
                onChange={onChange}
                onKeyDown={onKeyDown}
                busy={searching}
                disabled={searching}
                error={getErrorMessage(t, error)}
                inlineButton={
                    url &&
                    !pasted && (
                        <Button disabled={searching} onClick={search}>
                            {t('mediaSearch.webpage.selectButton')}
                        </Button>
                    )
                }
            />
        </InputContainer>
    );
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

function getErrorMessage(t: TFunction<'translation'>, error: State['error']) {
    if (!error) {
        return null;
    }

    if (error.code === 'invalid-url') {
        return t('mediaSearch.webpage.errorInvalid');
    }

    if (error.code === 'not-found') {
        return t('mediaSearch.webpage.errorNotFound');
    }

    return t('mediaSearch.webpage.errorGeneric');
}
