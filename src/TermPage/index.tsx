import { useParams } from 'react-router-dom';
import { useTerm } from '../dataHooks';
import Header from '../Header';

export default function TermPage() {
    const { termId } = useParams<{ termId: string }>();
    const [term] = useTerm(termId);

    if (!term) {
        return null;
    }

    return (
        <>
            <Header>{term.value}</Header>
        </>
    );
}
