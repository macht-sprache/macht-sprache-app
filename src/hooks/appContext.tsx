import type firebase from 'firebase';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuthState as _useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { DocReference, User, UserProperties, UserSettings } from '../types';
import { collections } from './data';

type AccountState = 'ANONYMOUS' | 'ACTIVE' | 'NEEDS_VERIFICATION' | 'DISABLED';

const appContext = createContext<{
    user?: User;
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

export const useAuthState = (): [firebase.User | undefined, boolean, firebase.auth.Error | undefined] =>
    _useAuthState(auth);

export const AppContextProvider: React.FC = ({ children }) => {
    const [authUser, loadingAuthUser] = useAuthState();
    const [user, loadingUser] = useLoadUser(authUser?.uid);
    const [userSettings, loadingUserSettings] = useLoadUserSettings(authUser?.uid);
    const [userProperties, loadingUserProperties] = useLoadUserProperties(authUser?.uid);
    const [sensitiveTerms] = useLoadSensitiveTerms();
    const accountState = useAccountState(authUser, userProperties);

    if (loadingAuthUser || loadingUser || loadingUserSettings || loadingUserProperties || !sensitiveTerms) {
        return null;
    }

    return (
        <appContext.Provider
            value={
                accountState === 'ACTIVE'
                    ? { user, userSettings, userProperties, sensitiveTerms, accountState }
                    : { accountState, sensitiveTerms }
            }
        >
            {children}
        </appContext.Provider>
    );
};

function useAccountState(authUser?: firebase.User, userProperties?: UserProperties): AccountState {
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

function useLoadUser(uid?: string) {
    return useSnapshot(getUserRef, uid);
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
    return useSnapshot(getUserSettingsRef, uid);
}

const getUserPropertiesRef = (uid: string) => collections.userProperties.doc(uid);

function useLoadUserProperties(uid?: string) {
    return useSnapshot(getUserPropertiesRef, uid);
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
