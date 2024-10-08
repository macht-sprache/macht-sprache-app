import firebase from 'firebase/compat/app';
import isEqual from 'lodash/isEqual';
import { DependencyList, useEffect, useMemo, useState } from 'react';
import { ERROR_NOT_FOUND } from '../constants';

type Query<T> = firebase.firestore.Query<T>;
type DocumentReference<T> = firebase.firestore.DocumentReference<T>;
type QuerySnapshot<T> = firebase.firestore.QuerySnapshot<T>;
type DocumentSnapshot<T> = firebase.firestore.DocumentSnapshot<T>;
export type Dictionary<T> = Partial<Record<string, T>>;

type Reference<T> = Query<T> | DocumentReference<T>;
type Snapshot<T, R extends Reference<T>> = R extends Query<T>
    ? QuerySnapshot<T>
    : R extends DocumentReference<T>
    ? DocumentSnapshot<T>
    : never;

export type GetListById<T> = () => Dictionary<T>;
export type GetList<T> = () => T[];
export type Get<T> = {
    (allowEmpty: true): T | undefined;
    (allowEmpty: false): T;
    (): T;
};

const referenceCache: (firebase.firestore.DocumentReference | firebase.firestore.Query)[] = [];
const readerCache = new WeakMap<firebase.firestore.DocumentReference | firebase.firestore.Query>();

const getStableRef = <T extends firebase.firestore.DocumentReference | firebase.firestore.Query>(ref: T): T => {
    const cachedRef = referenceCache.find(cachedRef => {
        if (
            ref instanceof firebase.firestore.DocumentReference &&
            cachedRef instanceof firebase.firestore.DocumentReference
        ) {
            return cachedRef.isEqual(ref);
        } else if (ref instanceof firebase.firestore.Query && cachedRef instanceof firebase.firestore.Query) {
            return cachedRef.isEqual(ref);
        }
        return false;
    });
    if (cachedRef) {
        return cachedRef as T;
    }
    referenceCache.push(ref);
    return ref;
};

const getInitialReader = <T, Ref extends Reference<T>>(ref: Ref) => {
    type Snap = Snapshot<T, Ref>;
    let initialSnapshot: Snap | undefined;
    let initialError: firebase.firestore.FirestoreError | undefined;
    const promise = (ref.get() as Promise<Snap>).then(
        snapshot => {
            initialSnapshot = snapshot;
        },
        error => (initialError = error)
    );
    return () => {
        if (initialError) {
            readerCache.delete(ref);
            console.log(initialError);
            throw initialError;
        }
        if (!initialSnapshot) {
            throw promise;
        }
        return initialSnapshot;
    };
};

function useSnapshot<T, Ref extends Reference<T>>(currentRef: Ref) {
    const ref = getStableRef(currentRef);
    const [state, setState] = useState<{ snapshot: Snapshot<T, Ref>; ref: Ref }>();

    useEffect(() => {
        const observer = (snapshot: Snapshot<T, Ref>) => {
            readerCache.set(ref, () => snapshot);
            setState({ snapshot, ref });
        };

        // @ts-ignore
        const unsubscribe = ref.onSnapshot(observer);
        return () => unsubscribe();
    }, [ref]);

    return useMemo(() => {
        if (state?.ref === ref) {
            return () => state.snapshot;
        } else {
            const cachedReader = readerCache.get(ref);
            if (cachedReader) {
                return cachedReader as () => Snapshot<T, typeof ref>;
            } else {
                const newReader = getInitialReader<T, typeof ref>(ref);
                readerCache.set(ref, newReader);
                return newReader;
            }
        }
    }, [ref, state?.ref, state?.snapshot]);
}

function useDocSnapshots<T, Ref extends DocumentReference<T>>(currentRefs: Ref[]) {
    const refs = currentRefs.map(getStableRef);
    const refIdentifier = refs.map(ref => ref.id).join();
    const [state, setState] = useState<{ snapshot: Snapshot<T, Ref>; ref: Ref }[]>([]);

    useEffect(() => {
        const unsubscribes = refs.map((ref, index) => {
            const observer = (snapshot: Snapshot<T, Ref>) => {
                readerCache.set(ref, () => snapshot);
                setState(prev => {
                    const next = [...prev];
                    next[index] = { snapshot, ref };
                    return next;
                });
            };
            // @ts-ignore
            return ref.onSnapshot(observer);
        });

        return () => unsubscribes.forEach(unsubscribe => unsubscribe());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refIdentifier]);

    return useMemo(() => {
        return () =>
            refs.map((ref, index) => {
                if (ref === state[index]?.ref) {
                    return state[index].snapshot;
                }
                const cachedReader: () => Snapshot<T, typeof ref> | undefined = readerCache.get(ref);
                if (cachedReader) {
                    return cachedReader();
                }
                const newReader = getInitialReader<T, typeof ref>(ref);
                readerCache.set(ref, newReader);
                return newReader();
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refIdentifier, state]);
}

function useCachedGetter<T extends (...args: any) => any>(getter: T, deps: DependencyList) {
    return useMemo(() => {
        let args: Parameters<T>;
        let result: ReturnType<T>;
        return (...newArgs: Parameters<T>) => {
            if (result !== undefined && isEqual(args, newArgs)) {
                return result;
            }
            args = newArgs;
            result = getter(...newArgs);
            return result;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

export function useCollection<T>(ref: Query<T>): GetList<T> {
    const snapshotReader = useSnapshot<T, typeof ref>(ref);
    return useCachedGetter(() => {
        const snapshot = snapshotReader();
        return snapshot.docs.map(doc => doc.data());
    }, [snapshotReader]);
}

export function useCollectionById<T>(ref: Query<T>): GetListById<T> {
    const snapshotReader = useSnapshot<T, typeof ref>(ref);
    return useCachedGetter(() => {
        const snapshot = snapshotReader();
        return snapshot.docs.reduce<Dictionary<T>>((acc, cur) => ({ ...acc, [cur.id]: cur.data() }), {});
    }, [snapshotReader]);
}

export function useCollectionByPath<T>(ref: Query<T>): GetListById<T> {
    const snapshotReader = useSnapshot<T, typeof ref>(ref);
    return useCachedGetter(() => {
        const snapshot = snapshotReader();
        return snapshot.docs.reduce<Dictionary<T>>((acc, cur) => ({ ...acc, [cur.ref.path]: cur.data() }), {});
    }, [snapshotReader]);
}

export function useDocument<T>(ref: DocumentReference<T>): Get<T> {
    const snapshotReader = useSnapshot<T, typeof ref>(ref);

    return useCachedGetter(
        (allowEmpty?: boolean) => {
            const snapshot = snapshotReader();
            const data = snapshot.data();

            if (data === undefined) {
                if (allowEmpty === true) {
                    return undefined;
                }

                throw ERROR_NOT_FOUND;
            }
            return data;
        },
        [snapshotReader]
    ) as Get<T>;
}

export function useDocuments<T>(refs: DocumentReference<T>[]): GetList<T> {
    const snapshotsReader = useDocSnapshots<T, DocumentReference<T>>(refs);
    return useCachedGetter(() => {
        const snapshots = snapshotsReader();
        return snapshots.map(snap => snap?.data()).filter((data): data is T => data !== undefined);
    }, [snapshotsReader]);
}
