import { onAuthStateChanged, User as AuthUser } from 'firebase/auth';
import type firebase from 'firebase/compat';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DocReference, User, UserProperties, UserSettings } from '../types';
import { useFirebaseAuth } from './auth';
import { collections } from './data';

export type AccountState = 'ANONYMOUS' | 'ACTIVE' | 'NEEDS_VERIFICATION' | 'DISABLED';

const appContext = createContext<{
    user?: User;
    authUser?: AuthUser;
    userSettings?: UserSettings;
    userProperties?: UserProperties;
    sensitiveTerms: Set<string>;
    accountState: AccountState;
}>({
    sensitiveTerms: new Set(),
    accountState: 'ANONYMOUS',
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

export const useUserProperties = () => {
    return useContext(appContext).userProperties;
};

export const useSensitiveTerms = () => {
    return useContext(appContext).sensitiveTerms;
};

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [authUser, loadingAuthUser] = useAuthUser();
    const [user, loadingUser] = useLoadUser(authUser?.uid, loadingAuthUser);
    const [userSettings, loadingUserSettings] = useLoadUserSettings(authUser?.uid, loadingAuthUser);
    const [userProperties, loadingUserProperties] = useLoadUserProperties(authUser?.uid, loadingAuthUser);
    const [sensitiveTerms] = useLoadSensitiveTerms();
    const accountState = useAccountState(authUser, userProperties);

    if (loadingAuthUser || loadingUser || loadingUserSettings || loadingUserProperties || !sensitiveTerms) {
        return null;
    }

    return (
        <appContext.Provider
            value={
                accountState === 'ACTIVE'
                    ? { user, authUser, userSettings, userProperties, sensitiveTerms, accountState }
                    : { authUser, accountState, sensitiveTerms }
            }
        >
            {children}
        </appContext.Provider>
    );
};

export const AppContextProviderExtension = ({ children }: { children: React.ReactNode }) => {
    const [sensitiveTerms] = useLoadSensitiveTerms();

    if (!sensitiveTerms) {
        return null;
    }

    return <appContext.Provider value={{ accountState: 'ANONYMOUS', sensitiveTerms }}>{children}</appContext.Provider>;
};

function useAuthUser() {
    const auth = useFirebaseAuth();
    const [{ authUser, loading, error }, setState] = useState<{
        authUser?: AuthUser;
        loading: boolean;
        error?: Error;
    }>({
        loading: true,
    });
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            newAuthUser => {
                setState({ authUser: newAuthUser ?? undefined, loading: false });
            },
            error => setState({ loading: false, error })
        );
        return () => {
            unsubscribe();
        };
    }, [auth]);
    return [authUser, loading, error] as const;
}

function useAccountState(authUser?: AuthUser, userProperties?: UserProperties): AccountState {
    const [tokenResult, setTokenResult] = useState<firebase.auth.IdTokenResult>();

    useEffect(() => {
        if (authUser) {
            authUser.getIdTokenResult().then(setTokenResult);
            return () => setTokenResult(undefined);
        }
    }, [authUser]);

    useEffect(() => {
        if (!tokenResult || !userProperties || !authUser) {
            return;
        }
        if (new Date(userProperties.tokenTime) > new Date(tokenResult.issuedAtTime)) {
            authUser.getIdTokenResult(true).then(setTokenResult);
        }
    }, [authUser, tokenResult, userProperties]);

    if (!authUser || !tokenResult || !userProperties) {
        return 'ANONYMOUS';
    }

    if (!tokenResult.claims.email_verified) {
        return 'NEEDS_VERIFICATION';
    }

    if (!userProperties.enabled) {
        return 'DISABLED';
    }

    return 'ACTIVE';
}

const getUserRef = (id: string) => collections.users.doc(id);

function useLoadUser(uid: string | undefined, authUserLoading: boolean) {
    return useSnapshot(getUserRef, uid, authUserLoading);
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

function useLoadUserSettings(uid: string | undefined, authUserLoading: boolean) {
    return useSnapshot(getUserSettingsRef, uid, authUserLoading);
}

const getUserPropertiesRef = (uid: string) => collections.userProperties.doc(uid);

function useLoadUserProperties(uid: string | undefined, authUserLoading: boolean) {
    return useSnapshot(getUserPropertiesRef, uid, authUserLoading);
}

function useSnapshot<T>(
    getRef: (docPath: string) => DocReference<T>,
    docPath: string | undefined,
    dependencyLoading?: boolean
) {
    const [{ value, loading, error }, setState] = useState<{
        value?: T;
        loading: boolean;
        error?: firebase.firestore.FirestoreError;
    }>({ loading: !!docPath || !!dependencyLoading });

    useEffect(() => {
        if (!docPath) {
            if (!dependencyLoading) {
                setState({ loading: false });
            }
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
    }, [dependencyLoading, docPath, getRef]);

    return [value, loading, error] as const;
}
