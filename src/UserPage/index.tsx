import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Checkbox } from '../Form/Checkbox';
import Header from '../Header';
import { useUser, useUserSettings } from '../hooks/appContext';
import { collections } from '../hooks/data';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import { UserSettings } from '../types';

export default function UserPage() {
    const user = useUser()!;
    const userSettings = useUserSettings()!;
    const { t } = useTranslation();

    const onChange = useCallback(
        (update: Partial<UserSettings>) => collections.userSettings.doc(user.id).set({ ...userSettings, ...update }),
        [user.id, userSettings]
    );

    return (
        <>
            <Header topHeading={[{ inner: t('userPage.title') }]}>{user.displayName}</Header>
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
        </>
    );
}
