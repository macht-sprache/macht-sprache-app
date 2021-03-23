import { useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import { functions } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import Header from '../Header';
import { collections, useCollection, useCollectionById } from '../hooks/data';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import { User, UserProperties } from '../types';
import s from './style.module.css';

type AuthUserInfo = { email: string; verified: boolean };
type AuthUserInfos = Partial<Record<string, { email: string; verified: boolean }>>;

const useAuthUserInfos = () => {
    const [authUserInfos, setAuthUserInfos] = useState<AuthUserInfos>({});
    useEffect(() => {
        let currentRequest = true;
        const fn = functions.httpsCallable('userManagement-getAuthUserInfos');
        fn().then(({ data }) => currentRequest && setAuthUserInfos(data));
        return () => {
            currentRequest = false;
        };
    }, []);
    return authUserInfos;
};

export default function AdminPage() {
    return (
        <>
            <Header>Administration</Header>
            <UserList />
        </>
    );
}

function UserList() {
    const users = [...useCollection(collections.users, [])].sort((a, b) => a.displayName.localeCompare(b.displayName));
    const userProperties = useCollectionById(collections.userProperties);
    const authUserInfos = useAuthUserInfos();

    return (
        <SingleColumn>
            <ColumnHeading>Users</ColumnHeading>
            <ul className={s.userList}>
                {users.map(user => (
                    <UserItem
                        key={user.id}
                        user={user}
                        properties={userProperties[user.id]}
                        authInfo={authUserInfos[user.id]}
                    />
                ))}
            </ul>
        </SingleColumn>
    );
}

function UserItem({
    user,
    properties,
    authInfo,
}: {
    user: User;
    properties?: UserProperties;
    authInfo?: AuthUserInfo;
}) {
    const setAdmin = (admin: boolean) => collections.userProperties.doc(user.id).set({ admin }, { merge: true });
    return (
        <li key={user.id} className={s.userItem}>
            <div className={s.userInfo}>
                <span className={s.userName}>{user.displayName}</span>
                {!!properties?.admin && (
                    <>
                        {' '}
                        <span className={s.tag}>Admin</span>
                    </>
                )}
                <br />
                {authInfo && (
                    <>
                        {authInfo.email} ({authInfo.verified ? 'Verified' : 'Not Verified'})
                    </>
                )}
            </div>
            <ButtonContainer>
                {!properties?.admin ? (
                    <ConfirmModal
                        title="Make Admin"
                        onConfirm={() => setAdmin(true)}
                        body={
                            <p>
                                Are you sure you want to make user <strong>{user.displayName}</strong> an admin?
                            </p>
                        }
                        confirmLabel="Confirm"
                    >
                        {onClick => <Button onClick={onClick}>Make Admin</Button>}
                    </ConfirmModal>
                ) : (
                    <ConfirmModal
                        title="Revoke Admin"
                        onConfirm={() => setAdmin(false)}
                        body={
                            <p>
                                Are you sure you want to revoke the admin role from user{' '}
                                <strong>{user.displayName}</strong> an admin?
                            </p>
                        }
                        confirmLabel="Confirm"
                    >
                        {onClick => <Button onClick={onClick}>Revoke Admin</Button>}
                    </ConfirmModal>
                )}
            </ButtonContainer>
        </li>
    );
}
