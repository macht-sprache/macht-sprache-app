import { useCallback, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { postVerifyHandler } from '../functions';
import { HOME, REGISTER_POST } from '../routes';
import { useAppContext } from './appContext';
import { addContinueParam } from './location';
import { useRequestState } from './useRequestState';

export type AuthHandlerParams = {
    actionCode: string;
    continueUrl: string | null;
};

export const useLogin = (continuePath: string = HOME, isVerification = false) => {
    const { user, accountState } = useAppContext();
    const history = useHistory();
    const [loginState, setLoginState, loginError] = useRequestState();
    const login = useCallback(
        (email: string, password: string) =>
            auth.signInWithEmailAndPassword(email, password).then(
                authUser => {
                    setLoginState('DONE');
                    if (isVerification) {
                        return postVerifyHandler();
                    }
                },
                error => setLoginState('ERROR', error)
            ),
        [isVerification, setLoginState]
    );

    useEffect(() => {
        if (loginState === 'DONE') {
            if (user) {
                history.push(continuePath);
            }
            if (accountState === 'DISABLED' || accountState === 'NEEDS_VERIFICATION') {
                history.push(addContinueParam(REGISTER_POST, continuePath));
            }
        }
    }, [accountState, continuePath, history, loginState, user]);

    return { login, loginState, loginError };
};

export const useAuthHandlerParams = (
    mode: 'resetPassword' | 'recoverEmail' | 'verifyEmail'
): AuthHandlerParams | undefined => {
    const location = useLocation();
    return useMemo(() => {
        const params = new URLSearchParams(location.search);
        const actionCode = params.get('oobCode');
        const continueUrl = params.get('continueUrl');

        if (mode !== params.get('mode') || !actionCode) {
            return;
        }

        return { actionCode, continueUrl };
    }, [location.search, mode]);
};
