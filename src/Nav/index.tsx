import { Link, NavLink } from 'react-router-dom';
import { useTerms } from '../dataHooks';
import s from './style.module.css';

export default function Nav() {
    return (
        <>
            <div className={s.header}>
                <Link className={s.logo} to="/">
                    macht.sprache.
                </Link>
            </div>
            <Terms />
        </>
    );
}

function Terms() {
    const [terms] = useTerms();

    if (!terms) {
        return null;
    }

    return (
        <ul className={s.terms}>
            {terms.map(term => (
                <li key={term.id} className={s.term}>
                    <NavLink to={`/term/${term.id}`} className={s.termLink} activeClassName={s.termLinkActive}>
                        {term.value}
                    </NavLink>
                </li>
            ))}
        </ul>
    );
}