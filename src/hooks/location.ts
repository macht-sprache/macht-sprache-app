import type { History, Location } from 'history';
import { useCallback, useContext } from 'react';
import { useHistory, __RouterContext as RouterContext } from 'react-router';
import { useLocation } from 'react-router-dom';
import { HOME } from '../routes';

const CONTINUE_PARAM = 'continue';

export const useContinuePath = () => {
    const { search } = useLocation();
    const continueParam = new URLSearchParams(search).get('continue');
    return continueParam ? decodeURIComponent(continueParam) : HOME;
};

export const addSearchParam = (url: string, [name, value]: [string, string]) => {
    const newUrl = new URL(url, window.location.origin);
    newUrl.searchParams.append(name, value);
    return newUrl.toString().replace(window.location.origin, '');
};

export const addContinueParam = (url: string, continuePath?: string) => {
    if (!continuePath || continuePath === url || continuePath === HOME) {
        return url;
    }

    return addSearchParam(url, [CONTINUE_PARAM, encodeURIComponent(continuePath)]);
};

export const useAddContinueParam = () => {
    const { pathname } = useLocation();

    return useCallback((url: string) => addContinueParam(url, pathname), [pathname]);
};

export function useSafeLocation(): Location | undefined {
    const routerContext = useContext(RouterContext);
    return routerContext?.location;
}

export function useSafeNavigate() {
    const history: History | undefined = useHistory();

    return useCallback(
        (to: string) => {
            if (history) {
                history.push(to);
            } else {
                const url = (process.env.REACT_APP_MAIN_ORIGIN || '') + to;
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        },
        [history]
    );
}
