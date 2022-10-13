import { useState } from 'react';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { Term, Translation } from '../../types';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import clsx from 'clsx';
import s from './style.module.css';

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
    maxResults = 3,
    onSelect = () => {},
}: SearchProps & { entities: Entity[] }) {
    const [searchResult, setSearchResult] = useState<Entity[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedResult, setSelectedResult] = useState(0);

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
                />
            </InputContainer>
            {!!searchResult.length && (
                <div className={s.resultContainer}>
                    {searchResult.map((entity, index) => (
                        <div
                            onClick={() => {
                                onSelect(entity);
                            }}
                            key={entity.id}
                            className={clsx(s.result, { [s.resultSelected]: selectedResult === index })}
                        >
                            {entity.value}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
