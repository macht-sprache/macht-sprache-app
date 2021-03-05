import type firebase from 'firebase';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState as _useAuthState } from 'react-firebase-hooks/auth';
import { collections } from './data';
import { auth } from '../firebase';
import { i18n } from '../i18n/config';
import { User } from '../types';
import { toLanguageOrDefault } from '../useLang';

const appContext = createContext<{ user?: User }>({});

export const useUser = () => {
    return useContext(appContext).user;
};

export const useAuthState = (): [firebase.User | undefined, boolean, firebase.auth.Error | undefined] =>
    _useAuthState(auth);

export const AppContextProvider: React.FC = ({ children }) => {
    const { user, loading } = useEnsureUserEntity();

    if (loading) {
        return null;
    }

    return <appContext.Provider value={{ user }}>{children}</appContext.Provider>;
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
    const [state, setState] = useState<{ user?: User; loading: boolean; error?: firebase.firestore.FirestoreError }>({
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

    return state;
}
