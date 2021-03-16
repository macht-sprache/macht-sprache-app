import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { REGISTER_POST } from '../routes';
import { addContinueParam } from './location';

export type AuthHandlerParams = {
    actionCode: string;
    continueUrl: string | null;
};

export const useLogin = () => {
    const history = useHistory();
    return useCallback(
        (email: string, password: string, continuePath?: string) =>
            auth.signInWithEmailAndPassword(email, password).then(auth => {
                if (!auth.user) {
                    return Promise.reject('No user present.');
                }
                if (auth.user.emailVerified) {
                    return auth.user;
                } else {
                    history.push(addContinueParam(REGISTER_POST, continuePath));
                }
            }),
        [history]
    );
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
