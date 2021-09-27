import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../components/ConfirmModal';
import { functions } from '../../firebase';
import Button, { ButtonContainer } from '../../components/Form/Button';
import { HorizontalRadio, HorizontalRadioContainer } from '../../components/Form/HorizontalRadio';
import { Input, Select, Textarea } from '../../components/Form/Input';
import InputContainer from '../../components/Form/InputContainer';
import { formatDate } from '../../components/FormatDate';
import { SimpleHeader } from '../../components/Header';
import { collections } from '../../hooks/data';
import { Get, GetList, GetListById, useCollection, useCollectionById, useDocument } from '../../hooks/fetch';
import { useRequestState } from '../../hooks/useRequestState';
import { langA, langB } from '../../languages';
import { ColumnHeading, FullWidthColumn, SingleColumn } from '../../components/Layout/Columns';
import { ModalDialog } from '../../components/ModalDialog';
import { Terms } from '../../components/Terms/TermsSmall';
import { GlobalSettings, User, UserProperties, UserSettings } from '../../types';
import { useLang } from '../../useLang';
import { UserInlineDisplay } from '../../components/UserInlineDisplay';
import s from './style.module.css';

type AuthUserInfo = { email: string; verified: boolean; creationTime: string };
type AuthUserInfos = Partial<Record<string, { email: string; verified: boolean; creationTime: string }>>;

type UserListProps = {
    getUsers: GetList<User>;
    getUserProperties: GetListById<UserProperties>;
    authUserInfos: AuthUserInfos;
};

type UserStatsProps = UserListProps & {
    getUserSettings: GetListById<UserSettings>;
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
const runSeedSubscriptions = () => functions.httpsCallable('userManagement-runSeedSubscriptions')();

type WeeklyDigestParams = {
    from: string;
    to: string;
    limit: number;
    intro: {
        [langA]: string;
        [langB]: string;
    };
};
const sendWeeklyDigestTest = (params: WeeklyDigestParams) =>
    functions.httpsCallable('userManagement-sendWeeklyDigestTest')(params);
const sendWeeklyDigest = (params: WeeklyDigestParams) =>
    functions.httpsCallable('userManagement-sendWeeklyDigest')(params);

const deleteAllContentOfUser = (userId: string) => {
    const fn = functions.httpsCallable('userManagement-deleteAllContentOfUser');
    return fn({ userId });
};

export default function AdminPage() {
    const getUsers = useCollection(collections.users);
    const getUserProperties = useCollectionById(collections.userProperties);
    const getUserSettings = useCollectionById(collections.userSettings);
    const getGlobalSettings = useDocument(collections.settings.doc('global'));
    const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', true));
    const authUserInfos = useAuthUserInfos();

    const userListProps = { getUsers, getUserProperties, authUserInfos };

    return (
        <>
            <SimpleHeader>Administration</SimpleHeader>

            <WeeklyDigest />

            <GlobalSetting getGlobalSettings={getGlobalSettings} />

            <UserList {...userListProps} />

            <UserStats {...userListProps} getUserSettings={getUserSettings} />

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
                    <RunSeedSubscriptionsButton />
                </ButtonContainer>
            </SingleColumn>
        </>
    );
}

function WeeklyDigest() {
    const [showModal, setShowModal] = useState(false);

    return (
        <SingleColumn>
            <ColumnHeading>Digest Mail</ColumnHeading>
            <Button onClick={() => setShowModal(true)}>Send or test digest mail…</Button>
            {showModal && <WeeklyDigestModal onClose={() => setShowModal(false)} />}
        </SingleColumn>
    );
}

function WeeklyDigestModal({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation();
    const [testMailState, setTestMailState] = useRequestState();
    const [realMailState, setRealMailState] = useRequestState();
    const [model, setModel] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
        limit: 25,
        introLangA: '',
        introLangB: '',
    });
    const disabled = testMailState === 'IN_PROGRESS' || realMailState === 'IN_PROGRESS';

    const updateModel = (update: Partial<typeof model>) => {
        if (testMailState !== 'INIT') {
            setTestMailState('INIT');
        }
        if (realMailState !== 'INIT') {
            setRealMailState('INIT');
        }
        setModel(prev => ({ ...prev, ...update }));
    };

    const sendTestMail = () => {
        setTestMailState('IN_PROGRESS');
        sendWeeklyDigestTest({
            from: model.from.toISOString(),
            to: model.to.toISOString(),
            limit: model.limit,
            intro: {
                [langA]: model.introLangA,
                [langB]: model.introLangB,
            },
        }).then(
            () => setTestMailState('DONE'),
            error => setTestMailState('ERROR', error)
        );
    };

    const sendRealMail = () => {
        setRealMailState('IN_PROGRESS');
        sendWeeklyDigest({
            from: model.from.toISOString(),
            to: model.to.toISOString(),
            limit: model.limit,
            intro: {
                [langA]: model.introLangA,
                [langB]: model.introLangB,
            },
        }).then(
            () => setRealMailState('DONE'),
            error => setRealMailState('ERROR', error)
        );
    };

    return (
        <ModalDialog onClose={onClose} isDismissable={false} title="Weekly Digest">
            <p>
                A mail to all users (that didn't unsubscribe) with all activity (up to the limit) in the specifed
                time-range. Send a test mail to yourself first by clicking the "Send Test Mail"-button.
            </p>
            <InputContainer>
                <Input
                    span={4}
                    disabled={disabled}
                    type="datetime-local"
                    label="From"
                    onChange={event => updateModel({ from: new Date(event.target.value) })}
                    value={dateToDateTimeLocal(model.from)}
                />
                <Input
                    span={3}
                    disabled={disabled}
                    type="datetime-local"
                    label="To"
                    onChange={event => updateModel({ to: new Date(event.target.value) })}
                    value={dateToDateTimeLocal(model.to)}
                />
                <Input
                    span={1}
                    disabled={disabled}
                    type="number"
                    label="Limit"
                    onChange={event => updateModel({ limit: parseInt(event.target.value) })}
                    value={model.limit}
                />
                <Textarea
                    label={`Intro ${t(`common.langLabels.${langA}` as const)}`}
                    placeholder="Leave blank for default intro"
                    value={model.introLangA}
                    onChange={event => updateModel({ introLangA: event.target.value })}
                />
                <Textarea
                    label={`Intro ${t(`common.langLabels.${langB}` as const)}`}
                    placeholder="Leave blank for default intro"
                    value={model.introLangB}
                    onChange={event => updateModel({ introLangB: event.target.value })}
                />
            </InputContainer>
            <ButtonContainer>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={disabled || testMailState === 'DONE'} onClick={sendTestMail} primary>
                    {(testMailState === 'INIT' || testMailState === 'ERROR') && 'Send Test Mail'}
                    {testMailState === 'IN_PROGRESS' && 'Sending Test Mail…'}
                    {testMailState === 'DONE' && 'Sent Test Mail!'}
                </Button>
                <Button
                    disabled={disabled || testMailState !== 'DONE' || realMailState === 'DONE'}
                    onClick={sendRealMail}
                    primary
                >
                    {(realMailState === 'INIT' || realMailState === 'ERROR') && 'Send to All Subscribers'}
                    {realMailState === 'IN_PROGRESS' && 'Sending to All Subscribers…'}
                    {realMailState === 'DONE' && 'Sent Mail to All!'}
                </Button>
            </ButtonContainer>
        </ModalDialog>
    );
}

function GlobalSetting({ getGlobalSettings }: { getGlobalSettings: Get<GlobalSettings> }) {
    const globalSettings = getGlobalSettings(true) || { enableNewUsers: true };
    return (
        <SingleColumn>
            <ColumnHeading>Global Settings</ColumnHeading>
            <EnableNewUsersSetting globalSettings={globalSettings} />
        </SingleColumn>
    );
}

function UserList({ getUsers, getUserProperties, authUserInfos }: UserListProps) {
    const [sortBy, setSortBy] = useState('name');
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
    const filters = ['name', 'date'];

    return (
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

function useNewsletterCsvObjectUrl(users: User[], authUserInfos: AuthUserInfos) {
    const csvHeader = 'Email,Name';
    const getCsvRow = (user: User) => `${authUserInfos[user.id]?.email ?? ''},${user.displayName}`;
    const csv = [csvHeader, ...users.map(getCsvRow), ''].join('\n');
    const objectUrl = useMemo(() => URL.createObjectURL(new Blob([csv])), [csv]);

    useEffect(() => {
        if (objectUrl) {
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [objectUrl]);

    return objectUrl;
}

function UserStats({ getUsers, getUserProperties, getUserSettings, authUserInfos }: UserStatsProps) {
    const users = getUsers();
    const userSettings = getUserSettings();
    const verifiedUsers = users.filter(user => authUserInfos[user.id]?.verified);
    const newsletterSubscribers = verifiedUsers.filter(user => userSettings[user.id]?.newsletter);
    const newsletterUnsubscribers = verifiedUsers.filter(user => !userSettings[user.id]?.newsletter);
    const digestSubscribers = verifiedUsers.filter(user => userSettings[user.id]?.digestMail);

    const newsletterSubscribersUrl = useNewsletterCsvObjectUrl(newsletterSubscribers, authUserInfos);
    const newsletterUnsubscribersUrl = useNewsletterCsvObjectUrl(newsletterUnsubscribers, authUserInfos);

    return (
        <SingleColumn>
            <ColumnHeading>User Stats</ColumnHeading>
            <p>
                <strong>Users: </strong>
                {users.length}
                <br />
                <strong>Verified Users: </strong>
                {verifiedUsers.length}
                <br />
                <strong>Newsletter Subscribers: </strong>
                {newsletterSubscribers.length}
                <br />
                <strong>Digest Subscribers: </strong>
                {digestSubscribers.length}
                <br />
            </p>
            <a href={newsletterSubscribersUrl} download="newsletter-subscribe.csv">
                Newsletter Subscribe List
            </a>
            {' | '}
            <a href={newsletterUnsubscribersUrl} download="newsletter-unsubscribe.csv">
                Newsletter Unsubscribe List
            </a>
        </SingleColumn>
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

function RunSeedSubscriptionsButton() {
    const [requestState, setRequestState] = useRequestState();
    const onConfirm = useCallback(() => {
        setRequestState('IN_PROGRESS');
        runSeedSubscriptions().then(
            () => setRequestState('DONE'),
            error => setRequestState('ERROR', error)
        );
    }, [setRequestState]);
    return (
        <ConfirmModal
            title="Run Seed Subscriptions?"
            body={<p>This will add subscriptions for user who already participated in discussions on terms.</p>}
            confirmLabel="Run"
            onConfirm={onConfirm}
        >
            {onClick => (
                <Button disabled={requestState === 'IN_PROGRESS' || requestState === 'DONE'} onClick={onClick}>
                    {requestState === 'DONE' ? 'Ran Seed Subscriptions' : 'Run Seed Subscriptions'}
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

const dateToDateTimeLocal = (date: Date) =>
    `${padNumberZero(date.getFullYear(), 4)}-${padNumberZero(date.getMonth() + 1)}-${padNumberZero(
        date.getDate()
    )}T${padNumberZero(date.getHours())}:${padNumberZero(date.getMinutes())}`;

const padNumberZero = (number: number, maxLength = 2) => number.toString().padStart(maxLength, '0');
