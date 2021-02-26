import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import { Lang } from '../../types';
import { useDomId } from '../../useDomId';
import s from './style.module.css';

type Props<T> = {
    label: string;
    lang: Lang;
    selectedItem?: T;
    onSelect: (medium: T | undefined) => void;
    searchFn: (query: string, lang: Lang) => Promise<T[]>;
    coverComponent: React.ComponentType<{ item: T; className?: string }>;
    selectedComponent: React.ComponentType<SelectedItemProps<T>>;
};

export type SelectedItemProps<T> = { item: T; onCancel: () => void };

function useSearch<T>(searchFn: Props<T>['searchFn'], lang: Lang, query: string) {
    const [state, setState] = useState<{ searching: boolean; results: T[] }>({ searching: false, results: [] });

    useEffect(() => {
        if (!query) {
            setState({ searching: false, results: [] });
        } else {
            let currentRequest = true;
            setState(prev => ({ ...prev, searching: true }));
            const timeoutId = window.setTimeout(() => {
                searchFn(query, lang).then(results => {
                    if (currentRequest) {
                        setState({ searching: false, results });
                    }
                });
            }, 500);
            return () => {
                window.clearTimeout(timeoutId);
                currentRequest = false;
            };
        }
    }, [lang, query, searchFn]);

    return state;
}

function useSelection<T>(onSelect: Props<T>['onSelect'], results: T[]) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (selectedIndex < results.length - 1) {
                    setSelectedIndex(prevIndex => prevIndex + 1);
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (selectedIndex !== 0) {
                    setSelectedIndex(prevIndex => prevIndex - 1);
                }
            }
            if (e.key === 'Enter') {
                onSelect(results[selectedIndex]);
            }
        },
        [selectedIndex, onSelect, results]
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    return { selectedIndex, onKeyDown };
}

export default function MediaSearch<T extends { id: string }>({
    label,
    selectedItem,
    onSelect,
    searchFn,
    lang,
    coverComponent: Cover,
    selectedComponent: Selected,
}: Props<T>) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const { searching, results } = useSearch<T>(searchFn, lang, query);
    const { selectedIndex, onKeyDown } = useSelection(onSelect, results);
    const id = useDomId();

    if (selectedItem) {
        return <Selected item={selectedItem} onCancel={() => onSelect(undefined)} />;
    }

    return (
        <div>
            <InputContainer>
                <Input
                    label={label}
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    busy={searching}
                    aria-describedby={id('resultListDescription')}
                    aria-owns={id('resultList')}
                    aria-expanded={!!results.length}
                    aria-autocomplete="both"
                    aria-activedescendant={id('result-' + selectedIndex)}
                    onKeyDown={onKeyDown}
                />
            </InputContainer>
            <div id={id('resultListDescription')} className={s.ariaInputDescription}>
                {!results.length && <>{t('mediaSearch.ariaNoResults')}</>}
                {t('mediaSearch.ariaDescription')}
            </div>
            {!!results.length && (
                <ul className={s.resultList} id={id('resultList')} role="listbox">
                    {results.map((item, index) => (
                        <li
                            key={item.id}
                            className={clsx(s.resultItem, { [s.ariaSelected]: selectedIndex === index })}
                            lang={lang}
                        >
                            <button
                                onClick={() => {
                                    onSelect(item);
                                }}
                                className={s.resultButton}
                                lang={lang}
                                role="option"
                                aria-selected={selectedIndex === index}
                                id={id('result-' + index)}
                            >
                                <Cover item={item} className={s.resultButtonIcon} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!results.length && !!query && <div className={s.noResults}>no results</div>}
        </div>
    );
}
