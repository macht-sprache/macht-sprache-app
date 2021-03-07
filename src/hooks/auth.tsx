import type firebase from 'firebase';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState as _useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { i18n } from '../i18n/config';
import { User } from '../types';
import { toLanguageOrDefault } from '../useLang';
import { collections } from './data';

const appContext = createContext<{ user?: User; sensitiveTerms: Set<string> }>({ sensitiveTerms: new Set() });

export const useUser = () => {
    return useContext(appContext).user;
};

export const useSensitiveTerms = () => {
    return useContext(appContext).sensitiveTerms;
};

export const useAuthState = (): [firebase.User | undefined, boolean, firebase.auth.Error | undefined] =>
    _useAuthState(auth);

export const AppContextProvider: React.FC = ({ children }) => {
    const [user, loadingUser] = useEnsureUserEntity();
    const [sensitiveTerms] = useLoadSensitiveTerms();

    if (loadingUser || !sensitiveTerms) {
        return null;
    }

    return <appContext.Provider value={{ user, sensitiveTerms }}>{children}</appContext.Provider>;
};

const ensureUserEntity = (authUser: firebase.User) =>
    authUser
        .getIdTokenResult()
        .then(token => (token.claims.email_verified ? token : authUser.getIdTokenResult(true)))
        .then(() =>
            collections.users.doc(authUser.uid).set({
                id: authUser.uid,
                displayName: authUser.displayName || authUser.email || '',
                lang: toLanguageOrDefault(i18n.language),
            })
        );

function useEnsureUserEntity() {
    const [{ user, loading, error }, setState] = useState<{
        user?: User;
        loading: boolean;
        error?: firebase.firestore.FirestoreError;
    }>({
        loading: true,
    });
    const [authUser, loadingAuthUser] = useAuthState();

    useEffect(() => {
        let initialFetch = true;

        if (!authUser) {
            if (!loadingAuthUser) {
                setState(prev => ({ ...prev, loading: false }));
            }
            return;
        }

        const unsubscribe = collections.users.doc(authUser.uid).onSnapshot(
            snapshot => {
                if (initialFetch && authUser.emailVerified && !snapshot.exists) {
                    console.log('No user entity yet. Creating…');
                    ensureUserEntity(authUser).catch(error => console.error(error));
                }
                initialFetch = false;
                setState({ user: snapshot.data(), loading: false, error: undefined });
            },
            error => {
                setState({ user: undefined, loading: false, error });
                console.error(error);
            }
        );

        return () => {
            setState(prev => ({ ...prev, user: undefined }));
            unsubscribe();
        };
    }, [authUser, loadingAuthUser]);

    return [user, loading, error] as const;
}

function useLoadSensitiveTerms() {
    const [{ sensitiveTerms, loading, error }, setState] = useState<{
        sensitiveTerms?: Set<string>;
        loading: boolean;
        error?: firebase.firestore.FirestoreError;
    }>({ loading: false });

    useEffect(() => {
        const unsubscribe = collections.sensitiveTerms.doc('global').onSnapshot(
            snapshot => {
                setState({
                    loading: false,
                    sensitiveTerms: new Set((snapshot.data()?.terms ?? []).map(term => term.toLowerCase())),
                });
            },
            error => {
                setState({ sensitiveTerms: undefined, loading: false, error });
                console.error(error);
            }
        );
        return () => unsubscribe();
    }, []);

    return [sensitiveTerms, loading, error] as const;
}
