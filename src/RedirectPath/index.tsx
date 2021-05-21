import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

type Props = {
    to: string;
};

export default function RedirectPath({ to }: Props) {
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        history.replace(to + location.search + location.hash);
    }, [history, location.hash, location.search, to]);

    return null;
}
