import { createContext, useContext } from 'react';
import { SourceType } from '../../../types';
import { useDomId } from '../../../useDomId';
import s from './style.module.css';

type RadioContext = {
    name: string;
    onChange: (type?: SourceType) => void;
    value?: SourceType;
};
type AllowedChild = React.ReactElement<typeof TypeSelector>;
type ContainerProps = RadioContext & { children: AllowedChild | AllowedChild[] };

const radioContext = createContext<RadioContext | null>(null);
const useRadioContext = () => {
    const context = useContext(radioContext);
    if (!context) {
        throw new Error('TypeSelector must be used inside TypeSelectorContainer.');
    }
    return context;
};

const icons = {
    MOVIE: require('./movie.svg').default,
    BOOK: require('./book.svg').default,
    NEWSPAPER: require('./newspaper.svg').default,
    OTHER: require('./other.svg').default,
    WEBPAGE: require('./website.svg').default,
};

type TypeSelectorProps = {
    label: string;
    value: SourceType | 'OTHER';
    disabled?: boolean;
};

export function TypeSelector({ label, value, disabled }: TypeSelectorProps) {
    const { name, value: selectedValue, onChange } = useRadioContext();
    const id = useDomId();

    return (
        <div className={s.labelWrapper}>
            <input
                type="radio"
                name={name}
                id={id(value)}
                value={value}
                checked={value === selectedValue}
                onChange={() => onChange(value !== 'OTHER' ? value : undefined)}
                disabled={disabled}
                className={s.radio}
            />
            <label htmlFor={id(value)} className={s.label}>
                <img src={icons[value]} alt="" aria-hidden className={s.icon} />
                <div className={s.labelText}>{label}</div>
            </label>
        </div>
    );
}

export function TypeSelectorContainer({ children, name, value, onChange }: ContainerProps) {
    const id = useDomId();

    return (
        <radioContext.Provider value={{ name: id(name), value, onChange }}>
            <div className={s.container}>{children}</div>
        </radioContext.Provider>
    );
}
