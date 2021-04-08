import { Suspense, useCallback, useState } from 'react';
import { TFuncKey, Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { CommentListWithLinks } from '../Comments/CommentList';
import Button, { ButtonContainer } from '../Form/Button';
import { Checkbox } from '../Form/Checkbox';
import { Input, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { useUser, useUserSettings } from '../hooks/appContext';
import { collections } from '../hooks/data';
import { Get, useCollection, useDocument } from '../hooks/fetch';
import { ColumnHeading, Columns } from '../Layout/Columns';
import LinkButton from '../LinkButton';
import { ModalDialog } from '../ModalDialog';
import { User, UserSettings } from '../types';
import { isValidUrl, removeHttpsWwwPageParams } from '../utils';
import s from './style.module.css';

const USER_LINKS: {
    type: 'twitter' | 'website' | 'instagram';
    getUrl: (handle?: string) => string;
    getLinkLabel: (handle?: string) => string;
    labelKey: TFuncKey<'translation'>;
    placeholerKey: TFuncKey<'translation'>;
    labelHintKey: TFuncKey<'translation'>;
    validate?: (input: string) => boolean;
    errorMessageKey?: TFuncKey<'translation'>;
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
        getUrl: (handle?: string) => `${isValidUrl(handle ?? '') && handle}`,
        getLinkLabel: (handle?: string) => `${removeHttpsWwwPageParams(handle)}`,
        labelKey: 'userPage.socialLabels.website.label',
        placeholerKey: 'userPage.socialLabels.website.placeholder',
        labelHintKey: 'userPage.socialLabels.website.inputHint',
        validate: (input: string) => input === '' || isValidUrl(input),
        errorMessageKey: 'userPage.socialLabels.website.error',
    },
];

export default function UserPageWrapper() {
    const { userId } = useParams<{ userId: string }>();
    const getUser = useDocument(collections.users.doc(userId));
    return <UserPage getUser={getUser} />;
}

function UserPage({ getUser }: { getUser: Get<User> }) {
    const loggedInUser = useUser();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);

    const user = getUser();
    const loggedInUserIsCurrentUser = loggedInUser?.id === user.id;

    const edit = loggedInUserIsCurrentUser ? () => setIsEditing(true) : undefined;

    return (
        <>
            <Header topHeading={[{ inner: t('userPage.title') }]} subLine={<UserBio user={user} edit={edit} />}>
                {user.displayName}
            </Header>
            <Columns>
                <UserInfo user={user} edit={edit} />
                {loggedInUser && loggedInUserIsCurrentUser && <EditUserSettings user={loggedInUser} />}
                <div>
                    <ColumnHeading>{t('common.entities.comment.value_plural')}</ColumnHeading>
                    <Suspense fallback={null}>
                        <Comments user={user} />
                    </Suspense>
                </div>
            </Columns>
            {isEditing && <EditUserInfo user={user} onClose={() => setIsEditing(false)} />}
        </>
    );
}

function Comments({ user }: { user: User }) {
    const getComments = useCollection(
        collections.comments.where('creator.id', '==', user.id).orderBy('createdAt').limit(10)
    );
    const comments = getComments();

    return <CommentListWithLinks comments={comments} />;
}

function UserInfo({ user, edit }: { user: User; edit?: () => void }) {
    const { t } = useTranslation();

    const externalProfiles = USER_LINKS.filter(({ type }) => user.externalProfiles?.[type]);

    return (
        <div>
            <ColumnHeading>{t('userPage.info')}</ColumnHeading>
            <div className={s.socialMedia}>
                {externalProfiles.length === 0 && edit && <>{t('userPage.addSocial')}</>}
                {externalProfiles.length === 0 && !edit && (
                    <>{t('userPage.noSocial', { displayName: user.displayName })}</>
                )}
                {externalProfiles.map(({ type, getUrl, getLinkLabel }) => {
                    return (
                        <div key={type}>
                            {type}:{' '}
                            <a target="_blank" rel="noreferrer" href={getUrl(user.externalProfiles?.[type])}>
                                {getLinkLabel(user.externalProfiles?.[type])}
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
        twitter: user.externalProfiles?.twitter || '',
        instagram: user.externalProfiles?.instagram || '',
        website: user.externalProfiles?.website || '',
    });

    const onSave = () => {
        setIsSaving(true);

        collections.users
            .doc(user.id)
            .set({ ...user, externalProfiles: { ...socialMediaState }, bio })
            .then(() => {
                setIsSaving(false);
                onClose();
            });
    };

    const formValid = USER_LINKS.every(({ type, validate }) => (validate ? validate(socialMediaState[type]) : true));

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

                        {USER_LINKS.map(
                            ({ type, labelHintKey, labelKey, placeholerKey, validate, errorMessageKey }) => {
                                return (
                                    <Input
                                        key={type}
                                        value={socialMediaState[type]}
                                        label={`${t(labelKey)} (${t(labelHintKey)})`}
                                        placeholder={t(placeholerKey).toString()}
                                        onChange={el => {
                                            setSocialMediaState(old => ({ ...old, [type]: el.target.value }));
                                        }}
                                        error={
                                            errorMessageKey &&
                                            validate &&
                                            !validate(socialMediaState[type]) && <>{t(errorMessageKey)}</>
                                        }
                                    />
                                );
                            }
                        )}
                    </InputContainer>
                    <ButtonContainer>
                        <Button onClick={onClose}>{t('common.formNav.cancel')}</Button>
                        <Button onClick={onSave} primary={true} disabled={!formValid}>
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
            <div className={s.bio}>{user.bio}</div>
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
        <div className={s.editSettings}>
            <ColumnHeading>{t('common.settings')}</ColumnHeading>

            <h3>{t('userPage.hideRedactedHeading')}</h3>
            <p>
                <Trans t={t} i18nKey="userPage.hideRedactedDescription" />
            </p>
            <Checkbox
                checked={!userSettings.showRedacted}
                onChange={event => onChange({ showRedacted: !event.target.checked })}
                label={t('userPage.hideRedacted')}
            />

            <h3>{t('common.newsletter')}</h3>

            <Checkbox
                checked={userSettings.newsletter}
                onChange={event => onChange({ newsletter: event.target.checked })}
                label={t('auth.register.newsletter')}
            />
        </div>
    );
}
