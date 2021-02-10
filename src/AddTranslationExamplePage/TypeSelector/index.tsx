import s from './style.module.css';

const icons = {
    MOVIE: require('./movie.svg').default,
    BOOK: require('./book.svg').default,
    NEWSPAPER: require('./newspaper.svg').default,
    OTHER: require('./other.svg').default,
    WEBSITE: require('./website.svg').default,
};

interface TypeSelectorProps
    extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: string;
    value: 'MOVIE' | 'BOOK' | 'NEWSPAPER' | 'OTHER' | 'WEBSITE';
}

export function TypeSelector({ label, value, ...props }: TypeSelectorProps) {
    const domId = 'id_' + value;

    return (
        <div className={s.labelWrapper}>
            <input type="radio" {...props} value={value} id={domId} className={s.radio} />
            <label htmlFor={domId} className={s.label}>
                <img src={icons[value]} alt="" aria-hidden="false" className={s.icon} />
                <div className={s.labelText}>{label}</div>
            </label>
        </div>
    );
}

type AllowedChild = React.ReactElement<typeof TypeSelector>;

export function TypeSelectorContainer({ children }: { children: AllowedChild | AllowedChild[] }) {
    return <div className={s.container}>{children}</div>;
}
