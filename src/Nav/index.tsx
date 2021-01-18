import { Link } from 'react-router-dom';
import { useTerms } from '../dataHooks';

export default function Nav() {
    return (
        <>
            <Link to="/">macht.sprache.</Link>
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
        <ul>
            {terms.map(term => (
                <li key={term.id}>
                    <Link to={`/term/${term.id}`}>{term.value}</Link>
                </li>
            ))}
        </ul>
    );
}
