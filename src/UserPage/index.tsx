import { useCallback, useState } from 'react';
import { TFuncKey, Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import Button, { ButtonContainer } from '../Form/Button';
import { Checkbox } from '../Form/Checkbox';
import { Input, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { useUser, useUserSettings } from '../hooks/appContext';
import { collections, useDocument } from '../hooks/data';
import { ColumnHeading, Columns } from '../Layout/Columns';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import { User, UserSettings } from '../types';
import { removeHttpsWwwPageParams } from '../utils';
import s from './style.module.css';

const USER_LINKS: {
    type: 'twitter' | 'website' | 'instagram';
    getUrl: (handle?: string) => string;
    getLinkLabel: (handle?: string) => string;
    labelKey: TFuncKey<'translation'>;
    placeholerKey: TFuncKey<'translation'>;
    labelHintKey: TFuncKey<'translation'>;
}[] = [
    {
        type: 'instagram',
        getUrl: (handle?: string) => `https://www.instagram.com/${handle}`,
        getLinkLabel: (handle?: string) => `@${handle}`,
        labelKey: 'userPage.socialLabels.instagram.label',
        placeholerKey: 'userPage.socialLabels.instagram.placeholder',
        labelHintKey: 'userPage.socialLabels.instagram.inputHint',
    },
    {
        type: 'twitter',
        getUrl: (handle?: string) => `https://twitter.com/${handle}`,
        getLinkLabel: (handle?: string) => `@${handle}`,
        labelKey: 'userPage.socialLabels.twitter.label',
        placeholerKey: 'userPage.socialLabels.twitter.placeholder',
        labelHintKey: 'userPage.socialLabels.twitter.inputHint',
    },
    {
        type: 'website',
        getUrl: (handle?: string) => `${handle}`,
        getLinkLabel: (handle?: string) => `${removeHttpsWwwPageParams(handle)}`,
        labelKey: 'userPage.socialLabels.website.label',
        placeholerKey: 'userPage.socialLabels.website.placeholder',
        labelHintKey: 'userPage.socialLabels.website.inputHint',
    },
];

export default function UserPage() {
    const { userId } = useParams<{ userId: string }>();
    const loggedInUser = useUser();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const user = useDocument(collections.users.doc(userId));
    const loggedInUserIsCurrentUser = loggedInUser?.id === userId;

    const edit = loggedInUserIsCurrentUser ? () => setIsEditing(true) : undefined;

    return (
        <>
            <Header topHeading={[{ inner: t('userPage.title') }]} subLine={<UserBio user={user} edit={edit} />}>
                {user.displayName}
            </Header>
            <Columns>
                <UserInfo user={user} edit={edit} />
                {loggedInUser && loggedInUserIsCurrentUser && <EditUserSettings user={loggedInUser} />}
            </Columns>
            {isEditing && <EditUserInfo user={user} onClose={() => setIsEditing(false)} />}
        </>
    );
}

function UserInfo({ user, edit }: { user: User; edit?: () => void }) {
    const { t } = useTranslation();

    const socialMediaProfiles = USER_LINKS.filter(({ type }) => user.socialMediaProfiles?.[type]);

    return (
        <div>
            <ColumnHeading>{t('userPage.info')}</ColumnHeading>
            <div className={s.socialMedia}>
                {socialMediaProfiles.length === 0 && edit && <>{t('userPage.addSocial')}</>}
                {socialMediaProfiles.map(({ type, getUrl, getLinkLabel }) => {
                    return (
                        <div key={type}>
                            {type}:{' '}
                            <a target="_blank" rel="noreferrer" href={getUrl(user.socialMediaProfiles?.[type])}>
                                {getLinkLabel(user.socialMediaProfiles?.[type])}
                            </a>
                        </div>
                    );
                })}
            </div>
            {edit && (
                <ButtonContainer align="left">
                    <Button onClick={edit}>{t('common.formNav.edit')}</Button>
                </ButtonContainer>
            )}
        </div>
    );
}

function EditUserInfo({ user, onClose }: { user: User; onClose: () => void }) {
    const { t } = useTranslation();

    const [saving, setIsSaving] = useState(false);

    const [bio, setBio] = useState(user.bio || '');
    const [socialMediaState, setSocialMediaState] = useState({
        twitter: user.socialMediaProfiles?.twitter || '',
        instagram: user.socialMediaProfiles?.instagram || '',
        website: user.socialMediaProfiles?.website || '',
    });

    const onSave = () => {
        setIsSaving(true);

        collections.users
            .doc(user.id)
            .set({ ...user, socialMediaProfiles: { ...socialMediaState }, bio })
            .then(() => {
                setIsSaving(false);
                onClose();
            });
    };

    return (
        <ModalDialog title={t('userPage.editInfo')} onClose={onClose}>
            {saving ? (
                <>{t('common.saving')}</>
            ) : (
                <>
                    <InputContainer>
                        <Textarea
                            value={bio}
                            onChange={({ target: { value } }) => {
                                setBio(value);
                            }}
                            maxLength={250}
                            minHeight="10rem"
                            label={t('userPage.bio')}
                        />

                        {USER_LINKS.map(({ type, labelHintKey, labelKey, placeholerKey }) => {
                            return (
                                <Input
                                    key={type}
                                    value={socialMediaState[type]}
                                    label={`${t(labelKey)} (${t(labelHintKey)})`}
                                    placeholder={t(placeholerKey).toString()}
                                    onChange={el => {
                                        setSocialMediaState(old => ({ ...old, [type]: el.target.value }));
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
        </ModalDialog>
    );
}

function UserBio({ user, edit }: { user: User; edit?: () => void }) {
    const { t } = useTranslation();

    return (
        <>
            {edit && !user.bio && (
                <div className={s.addBioHint}>
                    <Trans
                        t={t}
                        i18nKey="userPage.addBio"
                        components={{ AddDescription: <LinkButton onClick={edit} underlined /> }}
                    />
                </div>
            )}
            {user.bio}
            {edit && user.bio && (
                <>
                    {' '}
                    (
                    <LinkButton onClick={edit} underlined>
                        {t('common.formNav.edit')}
                    </LinkButton>
                    )
                </>
            )}
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
