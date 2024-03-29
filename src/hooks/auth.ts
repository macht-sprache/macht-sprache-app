import { Auth, signInWithEmailAndPassword, User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
    const auth = useFirebaseAuth();
    const { user, authUser, accountState } = useAppContext();
    const history = useHistory();
    const [loginUser, setLoginUser] = useState<User>();
    const [loginState, setLoginState, loginError] = useRequestState();
    const login = useCallback(
        (email: string, password: string) => {
            setLoginUser(undefined);
            setLoginState('IN_PROGRESS');
            signInWithEmailAndPassword(auth, email, password).then(
                credential => {
                    setLoginUser(credential.user!);
                    setLoginState('DONE');
                    if (isVerification) {
                        return postVerifyHandler();
                    }
                },
                error => setLoginState('ERROR', error)
            );
        },
        [auth, isVerification, setLoginState]
    );

    useEffect(() => {
        if (loginState === 'DONE' && authUser?.uid === loginUser?.uid) {
            if (user) {
                history.push(continuePath);
            }
            if (accountState === 'DISABLED' || accountState === 'NEEDS_VERIFICATION') {
                history.push(addContinueParam(REGISTER_POST, continuePath));
            }
        }
    }, [accountState, authUser, continuePath, history, loginState, loginUser?.uid, user]);

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

const authContext = createContext<Auth | undefined>(undefined);

export const AuthProvider = authContext.Provider;

export const useFirebaseAuth = () => {
    const auth = useContext(authContext);

    if (!auth) {
        throw new Error('used outside AuthContext');
    }

    return auth;
};

export const useOptionalFirebaseAuth = () => useContext(authContext);
