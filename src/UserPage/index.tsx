import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import Button, { ButtonContainer } from '../Form/Button';
import { Checkbox } from '../Form/Checkbox';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
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
                <UserInfo user={user} canEdit={loggedInUserIsCurrentUser} />
                {loggedInUserIsCurrentUser && <EditUserSettings user={loggedInUser} />}
            </Columns>
        </>
    );
}

function UserInfo({ user, canEdit }: { user: User; canEdit: boolean }) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div>
            <ColumnHeading>Info</ColumnHeading>
            {isEditing ? (
                <EditUserInfo user={user} onClose={() => setIsEditing(false)} />
            ) : (
                <>
                    {USER_LINKS.map(({ type, getUrl }) => {
                        return (
                            <div key={type}>
                                {type}:{' '}
                                {user.socialMediaProfiles?.[type] && (
                                    <a target="_blank" rel="noreferrer" href={getUrl(user.socialMediaProfiles[type])}>
                                        {user.socialMediaProfiles[type]}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                    {canEdit && (
                        <ButtonContainer align="left">
                            <Button onClick={() => setIsEditing(true)}>{t('common.formNav.edit')}</Button>
                        </ButtonContainer>
                    )}
                </>
            )}
        </div>
    );
}

function EditUserInfo({ user, onClose }: { user: User; onClose: () => void }) {
    const { t } = useTranslation();

    const [saving, setIsSaving] = useState(false);
    const [formState, setFormState] = useState({
        facebook: user.socialMediaProfiles?.facebook || '',
        twitter: user.socialMediaProfiles?.twitter || '',
        instagram: user.socialMediaProfiles?.instagram || '',
        website: user.socialMediaProfiles?.website || '',
    });

    const onSave = () => {
        setIsSaving(true);

        collections.users
            .doc(user.id)
            .set({ ...user, socialMediaProfiles: { ...formState } })
            .then(() => {
                setIsSaving(false);
                onClose();
            });
    };

    return (
        <div>
            {saving ? (
                <>{t('common.saving')}</>
            ) : (
                <>
                    <InputContainer>
                        {USER_LINKS.map(({ type }) => {
                            return (
                                <Input
                                    key={type}
                                    value={formState[type]}
                                    label={type}
                                    onChange={el => {
                                        setFormState(old => {
                                            return { ...old, [type]: el.target.value };
                                        });
                                    }}
                                />
                            );
                        })}
                    </InputContainer>
                    <ButtonContainer>
                        <Button onClick={onClose}>{t('common.formNav.cancel')}</Button>
                        <Button onClick={onSave} primary={true}>
                            {t('common.formNav.save')}
                        </Button>
                    </ButtonContainer>
                </>
            )}
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
