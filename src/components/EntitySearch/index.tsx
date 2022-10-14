import { useState } from 'react';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { Term, Translation } from '../../types';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import clsx from 'clsx';
import s from './style.module.css';
import { useDomId } from '../../useDomId';
import { useTranslation } from 'react-i18next';

type Entity = Term | Translation;

type SearchProps = {
    label: string;
    maxResults?: number;
    onSelect?: (entity: Entity) => void;
};

export function SearchTerm(props: SearchProps) {
    const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', false));
    const terms = getTerms();

    return <SearchEntity entities={terms} {...props} />;
}

export function SearchEntity({
    entities,
    label,
    maxResults = 5,
    onSelect = () => {},
}: SearchProps & { entities: Entity[] }) {
    const [searchResult, setSearchResult] = useState<Entity[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedResult, setSelectedResult] = useState(0);
    const { t } = useTranslation();
    const domId = useDomId();

    return (
        <div className={s.container}>
            <InputContainer>
                <Input
                    value={inputValue}
                    label={label}
                    onChange={({ target }) => {
                        setInputValue(target.value);
                        setSelectedResult(0);
                        if (target.value === '') {
                            setSearchResult([]);
                            return;
                        }
                        setSearchResult(
                            entities
                                .filter(({ value }) =>
                                    value.toLocaleLowerCase().includes(target.value.toLocaleLowerCase())
                                )
                                .slice(0, maxResults)
                        );
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            onSelect(searchResult[selectedResult]);
                        }
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                        }
                        if (e.key === 'ArrowUp' && selectedResult > 0) {
                            setSelectedResult(selectedResult - 1);
                        }
                        if (e.key === 'ArrowDown' && selectedResult < searchResult.length - 1) {
                            setSelectedResult(selectedResult + 1);
                        }
                    }}
                    role="combobox"
                    aria-expanded={!!searchResult}
                    aria-autocomplete="list"
                    aria-controls={domId('autocomplete')}
                />
            </InputContainer>
            {!!searchResult.length && (
                <ul className={s.resultContainer} id={domId('autocomplete')} role="listbox" aria-label={label}>
                    {searchResult.map((entity, index) => (
                        <li
                            onClick={() => {
                                onSelect(entity);
                            }}
                            key={entity.id}
                            className={clsx(s.result, { [s.resultSelected]: selectedResult === index })}
                            role="option"
                            aria-posinset={index}
                            aria-setsize={searchResult.length}
                            aria-selected={selectedResult === index}
                            tabIndex={-1}
                        >
                            {entity.value}
                        </li>
                    ))}
                </ul>
            )}
            <div role="status" aria-live="polite" aria-atomic="true" className={s.assertive}>
                {!!searchResult.length &&
                    t('a11y.autocomplete', {
                        searchResultCount: searchResult.length,
                        selected: searchResult[selectedResult]?.value,
                        selectedIndex: selectedResult + 1,
                    })}
            </div>
        </div>
    );
}
