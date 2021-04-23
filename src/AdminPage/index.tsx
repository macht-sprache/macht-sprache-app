import { useCallback, useEffect, useState } from 'react';
import ConfirmModal from '../ConfirmModal';
import { functions } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { HorizontalRadio, HorizontalRadioContainer } from '../Form/HorizontalRadio';
import { Select } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { formatDate } from '../FormatDate';
import Header from '../Header';
import { collections } from '../hooks/data';
import { Get, GetList, GetListById, useCollection, useCollectionById, useDocument } from '../hooks/fetch';
import { useRequestState } from '../hooks/useRequestState';
import { ColumnHeading, FullWidthColumn, SingleColumn } from '../Layout/Columns';
import { Terms } from '../Terms/TermsSmall';
import { GlobalSettings, User, UserProperties } from '../types';
import { useLang } from '../useLang';
import { UserInlineDisplay } from '../UserInlineDisplay';
import s from './style.module.css';

type AuthUserInfo = { email: string; verified: boolean; creationTime: string };
type AuthUserInfos = Partial<Record<string, { email: string; verified: boolean; creationTime: string }>>;

type UserListProps = {
    getUsers: GetList<User>;
    getUserProperties: GetListById<UserProperties>;
    getGlobalSettings: Get<GlobalSettings>;
};

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

const ensureValidUserEntities = () => functions.httpsCallable('userManagement-ensureValidUserEntities')();
const runContentMigrations = () => functions.httpsCallable('userManagement-runContentMigrations')();
const sendWeeklyDigest = () => functions.httpsCallable('userManagement-sendWeeklyDigest')();

const deleteAllContentOfUser = (userId: string) => {
    const fn = functions.httpsCallable('userManagement-deleteAllContentOfUser');
    return fn({ userId });
};

export default function AdminPage() {
    const getUsers = useCollection(collections.users);
    const getUserProperties = useCollectionById(collections.userProperties);
    const getGlobalSettings = useDocument(collections.settings.doc('global'));
    const userListProps = { getUsers, getUserProperties, getGlobalSettings };
    const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', true));

    return (
        <>
            <Header>Administration</Header>

            <WeeklyDigest />
            <UserList {...userListProps} />

            <SingleColumn>
                <ColumnHeading>Hidden Terms</ColumnHeading>
                <p>Terms that have been hidden with the admin option are listet here:</p>
                <Terms getTerms={getTerms} />
            </SingleColumn>

            <SingleColumn>
                <ColumnHeading>Data Migrations</ColumnHeading>
                <ButtonContainer align="left">
                    <EnsureValidUserEntitiesButton />
                    <RunContentMigrationsButton />
                </ButtonContainer>
            </SingleColumn>
        </>
    );
}

function WeeklyDigest() {
    const [state, setState] = useState<'sending' | 'sent' | undefined>();

    const send = () => {
        setState('sending');
        sendWeeklyDigest().then(() => {
            setState('sent');
        });
    };

    return (
        <SingleColumn>
            <ColumnHeading>Weekly digest mail</ColumnHeading>
            <p>{state}</p>
            <Button onClick={send}>send</Button>
        </SingleColumn>
    );
}

function UserList({ getUsers, getUserProperties, getGlobalSettings }: UserListProps) {
    const [sortBy, setSortBy] = useState('name');
    const authUserInfos = useAuthUserInfos();
    const users = [...getUsers()].sort((a, b) => {
        if (sortBy === 'name') {
            return a.displayName.localeCompare(b.displayName);
        } else {
            const dateA = authUserInfos[a.id]?.creationTime;
            const dateB = authUserInfos[b.id]?.creationTime;
            if (dateA && dateB) {
                return new Date(dateA) > new Date(dateB) ? -1 : 1;
            } else {
                return 0;
            }
        }
    });
    const userProperties = getUserProperties();
    const globalSettings = getGlobalSettings(true) || { enableNewUsers: true };

    const filters = ['name', 'date'];

    return (
        <>
            <SingleColumn>
                <ColumnHeading>Global Settings</ColumnHeading>
                <EnableNewUsersSetting globalSettings={globalSettings} />
            </SingleColumn>

            <FullWidthColumn>
                <ColumnHeading>Users</ColumnHeading>
                <div className={s.sortBy}>
                    <div>Sort by:</div>
                    <HorizontalRadioContainer>
                        {filters.map(filter => (
                            <HorizontalRadio
                                label={filter}
                                key={filter}
                                value={filter}
                                checked={filter === sortBy}
                                onChange={() => {
                                    setSortBy(filter);
                                }}
                            />
                        ))}
                    </HorizontalRadioContainer>
                </div>
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
            </FullWidthColumn>
        </>
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
    const [lang] = useLang();
    const setAdmin = (admin: boolean) => collections.userProperties.doc(user.id).set({ admin }, { merge: true });

    return (
        <li key={user.id} className={s.userItem}>
            <div className={s.userInfo}>
                <span className={s.userName}>
                    <UserInlineDisplay {...user} />
                </span>
                {!properties?.enabled && (
                    <>
                        {' '}
                        <span className={s.tag}>Disabled</span>
                    </>
                )}
                {!!properties?.admin && (
                    <>
                        {' '}
                        <span className={s.tag}>Admin</span>
                    </>
                )}
                <br />
                {authInfo && (
                    <>
                        {authInfo.email} ({authInfo.verified ? 'Verified' : 'Not Verified'})<br />
                        <div title="Registration Date">{formatDate(new Date(authInfo.creationTime), lang)}</div>
                    </>
                )}
            </div>
            <ButtonContainer>
                <EnableButton user={user} properties={properties} />
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
                <DeleteContentButton user={user} />
            </ButtonContainer>
        </li>
    );
}

function DeleteContentButton({ user }: { user: User }) {
    const [requestState, setRequestState] = useRequestState();
    const onConfirm = useCallback(() => {
        setRequestState('IN_PROGRESS');
        deleteAllContentOfUser(user.id).then(
            () => setRequestState('DONE'),
            error => setRequestState('ERROR', error)
        );
    }, [setRequestState, user.id]);
    return (
        <ConfirmModal
            title="Delete ALL Content?"
            body={
                <>
                    <p>
                        Are you sure that you want to delete all content created by user{' '}
                        <strong>{user.displayName}</strong>? This includes comments, terms, translations and translation
                        examples.
                    </p>
                    <p>
                        <strong>There is no way to undo this. Only do this in an emergency!</strong>
                    </p>
                </>
            }
            confirmLabel="Delete ALL Content FOREVER"
            onConfirm={onConfirm}
        >
            {onClick => (
                <Button disabled={requestState === 'IN_PROGRESS' || requestState === 'DONE'} onClick={onClick}>
                    {requestState === 'DONE' ? 'Content Deleted' : 'Delete Content'}
                </Button>
            )}
        </ConfirmModal>
    );
}

function EnableButton({ user, properties }: { user: User; properties?: UserProperties }) {
    const setEnabled = (enabled: boolean) => collections.userProperties.doc(user.id).set({ enabled }, { merge: true });

    if (properties?.enabled) {
        return (
            <ConfirmModal
                title="Disable User?"
                body={
                    <p>
                        Are you sure you want to disable user <strong>{user.displayName}</strong>? It will log them out
                        immediately and prevent them from creating further content. When they are enabled again they
                        will recieve an email.
                    </p>
                }
                confirmLabel="Disable"
                onConfirm={() => setEnabled(false)}
            >
                {onClick => <Button onClick={onClick}>Disable</Button>}
            </ConfirmModal>
        );
    } else {
        return (
            <ConfirmModal
                title="Enable User?"
                body={
                    <>
                        <p>
                            Are you sure you want to enable user <strong>{user.displayName}</strong>?
                        </p>
                        {properties && (
                            <p>They will recieve an email that they can start using their account (again).</p>
                        )}
                    </>
                }
                confirmLabel="Enable"
                onConfirm={() => setEnabled(true)}
            >
                {onClick => <Button onClick={onClick}>Enable</Button>}
            </ConfirmModal>
        );
    }
}

function EnsureValidUserEntitiesButton() {
    const [requestState, setRequestState] = useRequestState();
    const onConfirm = useCallback(() => {
        setRequestState('IN_PROGRESS');
        ensureValidUserEntities().then(
            () => setRequestState('DONE'),
            error => setRequestState('ERROR', error)
        );
    }, [setRequestState]);
    return (
        <ConfirmModal
            title="Ensure Valid User Entities?"
            body={
                <p>
                    This will make sure every user who ever registered has a valid User, UserProperties and UserSettings
                    entity.
                </p>
            }
            confirmLabel="Run"
            onConfirm={onConfirm}
        >
            {onClick => (
                <Button disabled={requestState === 'IN_PROGRESS' || requestState === 'DONE'} onClick={onClick}>
                    {requestState === 'DONE' ? 'Ensured Valid User Entities' : 'Ensure Valid User Entities'}
                </Button>
            )}
        </ConfirmModal>
    );
}

function RunContentMigrationsButton() {
    const [requestState, setRequestState] = useRequestState();
    const onConfirm = useCallback(() => {
        setRequestState('IN_PROGRESS');
        runContentMigrations().then(
            () => setRequestState('DONE'),
            error => setRequestState('ERROR', error)
        );
    }, [setRequestState]);
    return (
        <ConfirmModal
            title="Run Content Migrations?"
            body={<p>This will add defaults for newly added fields to content entites.</p>}
            confirmLabel="Run"
            onConfirm={onConfirm}
        >
            {onClick => (
                <Button disabled={requestState === 'IN_PROGRESS' || requestState === 'DONE'} onClick={onClick}>
                    {requestState === 'DONE' ? 'Ran Content Migrations' : 'Run Content Migrations'}
                </Button>
            )}
        </ConfirmModal>
    );
}

function EnableNewUsersSetting({ globalSettings }: { globalSettings?: GlobalSettings }) {
    const setEnableNewUsers = (enableNewUsers: boolean) =>
        collections.settings.doc('global').set({ enableNewUsers }, { merge: true });

    return (
        <InputContainer>
            <Select
                label="New users are by default"
                value={JSON.stringify(globalSettings?.enableNewUsers ?? false)}
                onChange={event => setEnableNewUsers(JSON.parse(event.target.value))}
            >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
            </Select>
        </InputContainer>
    );
}
