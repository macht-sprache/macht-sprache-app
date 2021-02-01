import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { useUser } from '../authHooks';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { HOME, REGISTER_POST } from '../routes';

type RegistrationState = 'INIT' | 'IN_PROGRESS' | 'DONE';

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
    const [registrationState, setRegistrationState] = useState<RegistrationState>('INIT');
    const loadingRegistration = registrationState === 'IN_PROGRESS';
    const disabled = loadingRegistration || !displayName || !email || !password;

    if (user && !loadingRegistration) {
        return <Redirect to={HOME} />;
    }

    if (registrationState === 'DONE') {
        return <Redirect to={REGISTER_POST} />;
    }

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setRegistrationState('IN_PROGRESS');
        signUp(displayName, email, password)
            .then(() => setRegistrationState('DONE'))
            .catch(error => {
                console.error(error);
                setRegistrationState('INIT');
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
                    />
                    <Input
                        label={t('auth.password')}
                        value={password}
                        autoComplete="new-password"
                        type="password"
                        onChange={event => {
                            setSetPassword(event.target.value);
                        }}
                    />
                </InputContainer>
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
