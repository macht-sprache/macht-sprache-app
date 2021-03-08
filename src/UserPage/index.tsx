import { useCallback } from 'react';
import Header from '../Header';
import { useUser, useUserSettings } from '../hooks/appContext';
import { collections } from '../hooks/data';
import { UserSettings } from '../types';

export default function UserPage() {
    const user = useUser()!;
    const userSettings = useUserSettings()!;

    const onChange = useCallback(
        (update: Partial<UserSettings>) => collections.userSettings.doc(user.id).set({ ...userSettings, ...update }),
        [user.id, userSettings]
    );

    return (
        <>
            <Header>Settings</Header>
            <label>
                <input
                    type="checkbox"
                    checked={userSettings.showRedacted}
                    onChange={event => onChange({ showRedacted: event.target.checked })}
                />{' '}
                Show Redacted
            </label>
        </>
    );
}
