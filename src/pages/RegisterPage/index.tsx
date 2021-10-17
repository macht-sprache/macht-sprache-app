import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FormEventHandler, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, Redirect } from 'react-router-dom';
import Button, { ButtonContainer } from '../../components/Form/Button';
import { Checkbox } from '../../components/Form/Checkbox';
import { ErrorBox } from '../../components/Form/ErrorBox';
import { Input } from '../../components/Form/Input';
import InputContainer from '../../components/Form/InputContainer';
import { SimpleHeader } from '../../components/Header';
import { SingleColumn } from '../../components/Layout/Columns';
import { DISPLAY_NAME_REGEX } from '../../constants';
import { auth } from '../../firebase';
import { isDisplayNameAvailable, postRegistrationHandler, sendEmailVerification } from '../../functions';
import { useUser } from '../../hooks/appContext';
import { addContinueParam, useContinuePath } from '../../hooks/location';
import { useRequestState } from '../../hooks/useRequestState';
import { IMPRINT, PRIVACY, REGISTER_POST } from '../../routes';
import { Lang } from '../../types';
import { useLang } from '../../useLang';
import s from './style.module.css';

const signUp = async (
    lang: Lang,
    displayName: string,
    newsletter: boolean,
    email: string,
    password: string,
    continuePath: string
) => {
    await isDisplayNameAvailable(displayName);

    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    if (!user) {
        throw Error('Account creation failed');
    }

    await updateProfile(user, { displayName });
    await postRegistrationHandler(displayName, lang, newsletter);

    if (!user.emailVerified) {
        await sendEmailVerification(lang, window.location.origin, continuePath);
    }
};

type RegistrationErrorLabels = {
    displayName?: string;
    email?: string;
    password?: string;
    generic?: string;
};

const useRegistrationErrorLabels = (
    registrationError: any,
    setRegistrationState: ReturnType<typeof useRequestState>['1']
) => {
    const { t } = useTranslation();

    const errorLabels: RegistrationErrorLabels = useMemo(() => {
        if (registrationError?.code === 'functions/already-exists') {
            return { displayName: t('auth.errors.name-already-in-use') };
        }
        if (registrationError?.code === 'auth/email-already-in-use') {
            return { email: t('auth.errors.email-already-in-use') };
        }
        if (registrationError?.code === 'auth/weak-password') {
            return { password: t('auth.errors.weak-password') };
        }
        if (registrationError) {
            return { generic: registrationError.message || t('common.error.general') };
        }
        return {};
    }, [registrationError, t]);

    const clearError = useCallback(
        (field: keyof RegistrationErrorLabels) => {
            if (errorLabels[field]) {
                setRegistrationState('INIT');
            }
        },
        [errorLabels, setRegistrationState]
    );

    return {
        errorLabels,
        clearError,
    };
};

export default function RegisterPage() {
    const user = useUser();
    const [lang] = useLang();
    const { t } = useTranslation();
    const continuePath = useContinuePath();

    const [displayName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');
    const [newsletter, setNewsletter] = useState(false);
    const [registrationState, setRegistrationState, registrationError] = useRequestState();
    const { errorLabels, clearError } = useRegistrationErrorLabels(registrationError, setRegistrationState);
    const loadingRegistration = registrationState === 'IN_PROGRESS';
    const validDisplayName = DISPLAY_NAME_REGEX.test(displayName);
    const disabled = loadingRegistration || !validDisplayName || !email || !password;

    if (user && !loadingRegistration) {
        return <Redirect to={continuePath} />;
    }

    if (registrationState === 'DONE') {
        return <Redirect to={addContinueParam(REGISTER_POST, continuePath)} />;
    }

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setRegistrationState('IN_PROGRESS');
        signUp(lang, displayName, newsletter, email, password, continuePath)
            .then(() => setRegistrationState('DONE'))
            .catch(error => {
                setRegistrationState('ERROR', error);
            });
    };

    return (
        <>
            <SimpleHeader>{t('auth.register.title')}</SimpleHeader>
            <SingleColumn>
                <p>{t('auth.register.intro')}</p>
                <form onSubmit={onSubmit}>
                    <InputContainer>
                        <Input
                            label={t('auth.displayName')}
                            value={displayName}
                            autoComplete="nickname"
                            disabled={registrationState === 'IN_PROGRESS'}
                            error={
                                !!displayName && !validDisplayName
                                    ? t('auth.displayNameRequirements')
                                    : errorLabels.displayName
                            }
                            onChange={event => {
                                setUserName(event.target.value);
                                clearError('displayName');
                            }}
                        />
                        <Input
                            label={t('auth.email')}
                            value={email}
                            type="email"
                            autoComplete="username"
                            onChange={event => {
                                setEmail(event.target.value);
                                clearError('email');
                            }}
                            disabled={registrationState === 'IN_PROGRESS'}
                            error={errorLabels.email}
                        />
                        <Input
                            label={t('auth.password')}
                            value={password}
                            autoComplete="new-password"
                            type="password"
                            onChange={event => {
                                setSetPassword(event.target.value);
                                clearError('password');
                            }}
                            disabled={registrationState === 'IN_PROGRESS'}
                            error={errorLabels.password}
                        />
                    </InputContainer>
                    <div className={s.newsletterCheckBox}>
                        <Checkbox
                            label={
                                <>
                                    {t('common.newsletter')}
                                    <br />
                                    {t('auth.register.newsletter')}
                                </>
                            }
                            checked={newsletter}
                            onChange={event => setNewsletter(event.target.checked)}
                        />
                    </div>
                    <p>
                        <Trans
                            t={t}
                            i18nKey="auth.register.termsAndPrivacy"
                            components={{ TermsLink: <Link to={IMPRINT} />, PrivacyLink: <Link to={PRIVACY} /> }}
                        />
                    </p>
                    {errorLabels.generic && <ErrorBox>{errorLabels.generic}</ErrorBox>}
                    <ButtonContainer>
                        <Button primary disabled={disabled} type="submit">
                            {t('auth.register.title')}
                        </Button>
                    </ButtonContainer>
                </form>
            </SingleColumn>
        </>
    );
}
