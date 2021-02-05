import type firebase from 'firebase';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState as _useAuthState } from 'react-firebase-hooks/auth';
import { collections } from './data';
import { auth } from '../firebase';
import { i18n } from '../i18n/config';
import { User } from '../types';
import { toLanguageOrDefault } from '../useLang';

const userContext = createContext<User | undefined>(undefined);

export const UserProvider = userContext.Provider;

export const useUser = () => {
    return useContext(userContext);
};

export const useAuthState = (): [firebase.User | undefined, boolean, firebase.auth.Error | undefined] =>
    _useAuthState(auth);

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

export function useEnsureUserEntity() {
    const [user, setUser] = useState<User>();
    const [authUser] = useAuthState();

    useEffect(() => {
        let initialFetch = true;

        if (!authUser) {
            return;
        }

        const unsubscribe = collections.users.doc(authUser.uid).onSnapshot(
            snapshot => {
                if (initialFetch && authUser.emailVerified && !snapshot.exists) {
                    console.log('No user entity yet. Creating…');
                    ensureUserEntity(authUser).catch(error => console.error(error));
                }
                initialFetch = false;
                setUser(snapshot.data());
            },
            error => console.error(error)
        );

        return () => {
            setUser(undefined);
            unsubscribe();
        };
    }, [authUser]);

    return user;
}
