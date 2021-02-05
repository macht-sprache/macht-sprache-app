import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { useUser } from '../authHooks';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { HOME, REGISTER_POST } from '../routes';

type RegistrationState = { state: 'INIT' } | { state: 'IN_PROGRESS' } | { state: 'DONE' } | { state: 'ERROR' };

const signUp = async (displayName: string, email: string, password: string) => {
    const { user } = await auth.createUserWithEmailAndPassword(email, password);

    if (!user) {
        throw Error('Account creation failed');
    }

    await user.updateProfile({ displayName });

    if (!user.emailVerified) {
        await user.sendEmailVerification({
            url: window.location.origin + REGISTER_POST + '?success',
        });
    }
};

export default function RegisterPage() {
    const user = useUser();
    const { t } = useTranslation();
    const [displayName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');
    const [registrationState, setRegistrationState] = useState<RegistrationState>({ state: 'INIT' });
    const [registrationError, setRegistrationError] = useState<any>();
    const loadingRegistration = registrationState === { state: 'IN_PROGRESS' };
    const disabled = loadingRegistration || !displayName || !email || !password;

    if (user && !loadingRegistration) {
        return <Redirect to={HOME} />;
    }

    if (registrationState.state === 'DONE') {
        return <Redirect to={REGISTER_POST} />;
    }

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setRegistrationState({ state: 'IN_PROGRESS' });
        setRegistrationError(undefined);
        signUp(displayName, email, password)
            .then(() => setRegistrationState({ state: 'DONE' }))
            .catch(error => {
                setRegistrationError(error);
                setRegistrationState({ state: 'ERROR' });
            });
    };

    return (
        <>
            <Header>{t('auth.register')}</Header>
            <form style={{ maxWidth: '500px' }} onSubmit={onSubmit}>
                <InputContainer>
                    <Input
                        label={t('auth.displayName')}
                        value={displayName}
                        autoComplete="nickname"
                        onChange={event => {
                            setUserName(event.target.value);
                        }}
                    />
                    <Input
                        label={t('auth.email')}
                        value={email}
                        type="email"
                        autoComplete="username"
                        onChange={event => {
                            setEmail(event.target.value);
                        }}
                        error={
                            registrationError?.code === 'auth/email-already-in-use' &&
                            t('auth.errors.email-already-in-use')
                        }
                    />
                    <Input
                        label={t('auth.password')}
                        value={password}
                        autoComplete="new-password"
                        type="password"
                        onChange={event => {
                            setSetPassword(event.target.value);
                        }}
                        error={registrationError?.code === 'auth/weak-password' && t('auth.errors.weak-password')}
                    />
                </InputContainer>
                {registrationError.code &&
                    registrationError.code !== 'auth/weak-password' &&
                    registrationError.code !== 'auth/email-already-in-use' && (
                        <ErrorBox>{registrationError.message}</ErrorBox>
                    )}
                <ButtonContainer>
                    <Button type="button">Cancel</Button>
                    <Button primary disabled={disabled} type="submit">
                        {t('auth.register')}
                    </Button>
                </ButtonContainer>
            </form>
        </>
    );
}
