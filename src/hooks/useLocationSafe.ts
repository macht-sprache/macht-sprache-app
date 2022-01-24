import { useContext } from 'react';
import type { Location } from 'history';
import { __RouterContext as RouterContext } from 'react-router';

export function useLocationSafe(): Location | undefined {
    const routerContext = useContext(RouterContext);
    return routerContext?.location;
}
