import type firebase from 'firebase';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthState as _useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { i18n } from '../i18n/config';
import { DocReference, User, UserSettings } from '../types';
import { toLanguageOrDefault } from '../useLang';
import { collections } from './data';

const appContext = createContext<{ user?: User; userSettings?: UserSettings; sensitiveTerms: Set<string> }>({
    sensitiveTerms: new Set(),
});

export const useAppContext = () => {
    return useContext(appContext);
};

export const useUser = () => {
    return useContext(appContext).user;
};

export const useUserSettings = () => {
    return useContext(appContext).userSettings;
};

export const useSensitiveTerms = () => {
    return useContext(appContext).sensitiveTerms;
};

export const useAuthState = (): [firebase.User | undefined, boolean, firebase.auth.Error | undefined] =>
    _useAuthState(auth);

export const AppContextProvider: React.FC = ({ children }) => {
    const [authUser, loadingAuthUser] = useAuthState();
    const [user, loadingUser] = useEnsureUserEntity(authUser, loadingAuthUser);
    const [userSettings, loadingUserSettings] = useLoadUserSettings(authUser?.uid);
    const [sensitiveTerms] = useLoadSensitiveTerms();

    if (loadingUser || loadingUserSettings || !sensitiveTerms) {
        return null;
    }

    return <appContext.Provider value={{ user, userSettings, sensitiveTerms }}>{children}</appContext.Provider>;
};

const ensureUpdatedToken = (authUser: firebase.User) =>
    authUser.getIdTokenResult().then(token => (token.claims.email_verified ? token : authUser.getIdTokenResult(true)));

export const ensureUserEntity = (authUser: firebase.User) =>
    ensureUpdatedToken(authUser).then(() =>
        collections.users.doc(authUser.uid).set({
            id: authUser.uid,
            displayName: authUser.displayName || authUser.email || '',
        })
    );

function useEnsureUserEntity(authUser: firebase.User | undefined, loadingAuthUser: boolean) {
    const [{ user, loading, error }, setState] = useState<{
        user?: User;
        loading: boolean;
        error?: firebase.firestore.FirestoreError;
    }>({
        loading: true,
    });

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

    useEffect(() => {
        if (authUser && user) {
            ensureUpdatedToken(authUser);
        }
    }, [authUser, user]);

    return [user, loading, error] as const;
}

const getSenstiveTermsRef = (id: string) => collections.sensitiveTerms.doc(id);

function useLoadSensitiveTerms() {
    const [value, loading, error] = useSnapshot(getSenstiveTermsRef, 'global');

    const sensitiveTerms = useMemo(() => {
        if (loading || error) {
            return;
        }
        return new Set((value?.terms ?? []).map(term => term.toLowerCase()));
    }, [error, loading, value?.terms]);

    return [sensitiveTerms, loading, error] as const;
}

const getUserSettingsRef = (uid: string) => collections.userSettings.doc(uid);

function useLoadUserSettings(uid?: string) {
    const [value, loading, error] = useSnapshot(getUserSettingsRef, uid);

    const userSettings = useMemo<UserSettings | undefined>(() => {
        if (loading || error || !uid) {
            return undefined;
        }
        return (
            value || {
                lang: toLanguageOrDefault(i18n.language),
                showRedacted: false,
            }
        );
    }, [error, loading, uid, value]);

    return [userSettings, loading, error] as const;
}

function useSnapshot<T>(getRef: (docPath: string) => DocReference<T>, docPath: string | undefined) {
    const [{ value, loading, error }, setState] = useState<{
        value?: T;
        loading: boolean;
        error?: firebase.firestore.FirestoreError;
    }>({ loading: true });

    useEffect(() => {
        if (!docPath) {
            setState({ loading: false });
            return;
        }

        const unsubscribe = getRef(docPath).onSnapshot(
            snapshot => {
                setState({
                    loading: false,
                    value: snapshot.data(),
                });
            },
            error => {
                setState({ loading: false, error });
                console.error(error);
            }
        );

        return () => {
            unsubscribe();
            setState({ loading: false });
        };
    }, [docPath, getRef]);

    return [value, loading, error] as const;
}
