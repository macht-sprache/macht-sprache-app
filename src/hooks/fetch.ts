import firebase from 'firebase';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ERROR_NOT_FOUND } from '../constants';

type CollectionReference<T> = firebase.firestore.CollectionReference<T>;
type DocumentReference<T> = firebase.firestore.DocumentReference<T>;
type QuerySnapshot<T> = firebase.firestore.QuerySnapshot<T>;
type DocumentSnapshot<T> = firebase.firestore.DocumentSnapshot<T>;
type Dictionary<T> = Partial<Record<string, T>>;

export type GetListById<T> = () => Dictionary<T>;
export type GetList<T> = () => T[];
export type Get<T> = {
    (allowEmpty: true): T | undefined;
    (allowEmpty: false): T;
    (): T;
};

const useStableCollectionRef = <T extends firebase.firestore.Query>(ref: T) => {
    const lastRef = useRef<T>(ref);
    useEffect(() => {
        if (!lastRef.current.isEqual(ref)) {
            lastRef.current = ref;
        }
    }, [ref]);
    return lastRef.current.isEqual(ref) ? lastRef.current : ref;
};

const useStableDocumentRef = <T extends firebase.firestore.DocumentReference>(ref: T) => {
    const lastRef = useRef<T>(ref);
    useEffect(() => {
        if (!lastRef.current.isEqual(ref)) {
            lastRef.current = ref;
        }
    }, [ref]);
    return lastRef.current.isEqual(ref) ? lastRef.current : ref;
};

function useQuerySnapshot<T>(currentRef: CollectionReference<T>) {
    const ref = useStableCollectionRef(currentRef);
    const [state, setState] = useState<{ snapshot: QuerySnapshot<T>; ref: CollectionReference<T> }>();

    useEffect(() => {
        const unsubscribe = ref.onSnapshot(snapshot => {
            setState({ snapshot, ref });
        });
        return () => unsubscribe();
    }, [ref]);

    return useMemo(() => {
        if (state?.ref === ref) {
            return () => state.snapshot;
        } else {
            let initialSnapshot: QuerySnapshot<T> | undefined;
            let initialError: firebase.firestore.FirestoreError | undefined;
            const promise = ref.get().then(
                snapshot => (initialSnapshot = snapshot),
                error => (initialError = error)
            );
            return () => {
                if (initialError) {
                    throw initialError;
                }
                if (!initialSnapshot) {
                    throw promise;
                }
                return initialSnapshot;
            };
        }
    }, [ref, state]);
}

function useDocumentSnapshot<T>(currentRef: DocumentReference<T>) {
    const ref = useStableDocumentRef(currentRef);
    const [state, setState] = useState<{ snapshot: DocumentSnapshot<T>; ref: DocumentReference<T> }>();

    useEffect(() => {
        const unsubscribe = ref.onSnapshot(snapshot => {
            setState({ snapshot, ref });
        });
        return () => unsubscribe();
    }, [ref]);

    return useMemo(() => {
        if (state?.ref === ref) {
            return () => state.snapshot;
        } else {
            let initialSnapshot: DocumentSnapshot<T> | undefined;
            let initialError: firebase.firestore.FirestoreError | undefined;
            const promise = ref.get().then(
                snapshot => (initialSnapshot = snapshot),
                error => (initialError = error)
            );
            return () => {
                if (initialError) {
                    throw initialError;
                }
                if (!initialSnapshot) {
                    throw promise;
                }
                return initialSnapshot;
            };
        }
    }, [ref, state]);
}

export function useCollection<T>(ref: CollectionReference<T>): GetList<T> {
    const snapshotReader = useQuerySnapshot(ref);
    return useCallback(() => {
        const snapshot = snapshotReader();
        return snapshot.docs.map(doc => doc.data());
    }, [snapshotReader]);
}

export function useCollectionById<T>(ref: CollectionReference<T>): GetListById<T> {
    const snapshotReader = useQuerySnapshot(ref);
    return useCallback(() => {
        const snapshot = snapshotReader();
        return snapshot.docs.reduce<Dictionary<T>>((acc, cur) => ({ ...acc, [cur.id]: cur.data() }), {});
    }, [snapshotReader]);
}

export function useDocument<T>(ref: DocumentReference<T>): Get<T> {
    const snapshotReader = useDocumentSnapshot(ref);
    return useMemo(() => {
        // @ts-ignore
        const reader: Get<T> = (allowEmpty?: boolean) => {
            const snapshot = snapshotReader();
            const data = snapshot.data();

            if (data === undefined) {
                if (allowEmpty === true) {
                    return undefined;
                }

                throw ERROR_NOT_FOUND;
            }
            return data;
        };
        return reader;
    }, [snapshotReader]);
}
