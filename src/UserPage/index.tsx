import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Checkbox } from '../Form/Checkbox';
import Header from '../Header';
import { useUser, useUserSettings } from '../hooks/appContext';
import { collections, useDocument } from '../hooks/data';
import { ColumnHeading, Columns } from '../Layout/Columns';
import { User, UserSettings } from '../types';

const USER_LINKS: { type: 'facebook' | 'twitter' | 'website' | 'instagram'; getUrl: (handle?: string) => string }[] = [
    {
        type: 'facebook',
        getUrl: (handle?: string) => `https://www.facebook.com/${handle}`,
    },
    {
        type: 'twitter',
        getUrl: (handle?: string) => `https://twitter.com/${handle}`,
    },
    {
        type: 'website',
        getUrl: (handle?: string) => `${handle}`,
    },
    {
        type: 'instagram',
        getUrl: (handle?: string) => `https://www.instagram.com/${handle}`,
    },
];

export default function UserPage() {
    const { userId } = useParams<{ userId: string }>();
    const loggedInUser = useUser()!;
    const { t } = useTranslation();
    const user = useDocument(collections.users.doc(userId));
    const loggedInUserIsCurrentUser = loggedInUser.id === userId;

    return (
        <>
            <Header topHeading={[{ inner: t('userPage.title') }]}>{user.displayName}</Header>
            <Columns>
                <UserInfo user={user} />
                {loggedInUserIsCurrentUser && <EditUserSettings user={loggedInUser} />}
            </Columns>
        </>
    );
}

function UserInfo({ user }: { user: User }) {
    return (
        <div>
            <ColumnHeading>Info</ColumnHeading>
            {USER_LINKS.map(({ type, getUrl }) => {
                return (
                    <div key={type}>
                        {type}:{' '}
                        {user[type] && (
                            <a target="_blank" rel="noreferrer" href={getUrl(user[type])}>
                                {user[type]}
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function EditUserSettings({ user }: { user: User }) {
    const { t } = useTranslation();
    const userSettings = useUserSettings()!;

    const onChange = useCallback(
        (update: Partial<UserSettings>) => collections.userSettings.doc(user.id).set({ ...userSettings, ...update }),
        [user.id, userSettings]
    );

    return (
        <div>
            <ColumnHeading>{t('common.settings')}</ColumnHeading>

            <p>
                <Trans t={t} i18nKey="userPage.hideRedactedDescription" />
            </p>
            <label>
                <Checkbox
                    checked={!userSettings.showRedacted}
                    onChange={event => onChange({ showRedacted: !event.target.checked })}
                    label={t('userPage.hideRedacted')}
                />
            </label>
        </div>
    );
}
