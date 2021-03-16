import { useCallback, useState } from 'react';

type RequestState = 'INIT' | 'IN_PROGRESS' | 'DONE' | 'ERROR';

export const useRequestState = () => {
    const [state, setState] = useState<{ state: RequestState; error?: any }>({
        state: 'INIT',
    });
    const setRequestState = useCallback((newState: RequestState, error?: unknown) => {
        setState({ state: newState, error });
        if (error) {
            console.error(error);
        }
    }, []);

    return [state.state, setRequestState, state.error] as const;
};
