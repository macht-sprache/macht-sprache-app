import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { HOME } from '../routes';

const CONTINUE_PARAM = 'continue';

export const useContinuePath = () => {
    const { search } = useLocation();
    const continueParam = new URLSearchParams(search).get('continue');
    return continueParam ? decodeURIComponent(continueParam) : HOME;
};

export const addContinueParam = (url: string, continuePath: string) => {
    if (!continuePath || continuePath === url || continuePath === HOME) {
        return url;
    }

    const newUrl = new URL(url, window.location.origin);
    newUrl.searchParams.append(CONTINUE_PARAM, encodeURIComponent(continuePath));
    return newUrl.toString().replace(window.location.origin, '');
};

export const useAddContinueParam = (customPath?: string) => {
    const { pathname } = useLocation();

    return useCallback((url: string) => addContinueParam(url, pathname), [pathname]);
};
