import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Checkbox } from '../Form/Checkbox';
import Header from '../Header';
import { useUser, useUserSettings } from '../hooks/appContext';
import { collections, useDocument } from '../hooks/data';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import { User, UserSettings } from '../types';

export default function UserPage() {
    const { userId } = useParams<{ userId: string }>();
    const loggedInUser = useUser()!;
    const { t } = useTranslation();
    const user = useDocument(collections.users.doc(userId));
    const loggedInUserIsCurrentUser = loggedInUser.id === userId;

    return (
        <>
            <Header topHeading={[{ inner: t('userPage.title') }]}>{user.displayName}</Header>
            {loggedInUserIsCurrentUser && <EditUserSettings user={loggedInUser} />}
        </>
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
        <SingleColumn>
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
        </SingleColumn>
    );
}
