import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { sendEmailVerification } from '../functions';
import Header from '../Header';
import { useUser } from '../hooks/appContext';
import { addContinueParam, useContinuePath } from '../hooks/location';
import { SingleColumn } from '../Layout/Columns';
import { REGISTER_POST } from '../routes';

type RegistrationState = 'INIT' | 'IN_PROGRESS' | 'DONE' | 'ERROR';

const signUp = async (displayName: string, email: string, password: string, continuePath: string) => {
    const { user } = await auth.createUserWithEmailAndPassword(email, password);

    if (!user) {
        throw Error('Account creation failed');
    }

    await user.updateProfile({ displayName });

    if (!user.emailVerified) {
        await sendEmailVerification(window.location.origin, REGISTER_POST, continuePath);
    }
};

export default function RegisterPage() {
    const user = useUser();
    const { t } = useTranslation();
    const continuePath = useContinuePath();

    const [displayName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');
    const [registrationState, setRegistrationState] = useState<RegistrationState>('INIT');
    const [registrationError, setRegistrationError] = useState<any>();
    const loadingRegistration = registrationState === 'IN_PROGRESS';
    const disabled = loadingRegistration || !displayName || !email || !password;

    if (user && !loadingRegistration) {
        return <Redirect to={continuePath} />;
    }

    if (registrationState === 'DONE') {
        return <Redirect to={addContinueParam(REGISTER_POST, continuePath)} />;
    }

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setRegistrationState('IN_PROGRESS');
        setRegistrationError(undefined);
        signUp(displayName, email, password, continuePath)
            .then(() => setRegistrationState('DONE'))
            .catch(error => {
                setRegistrationError(error);
                setRegistrationState('ERROR');
            });
    };

    return (
        <>
            <Header>{t('auth.register.title')}</Header>
            <SingleColumn>
                <p>{t('auth.register.intro')}</p>
                <form onSubmit={onSubmit}>
                    <InputContainer>
                        <Input
                            label={t('auth.displayName')}
                            value={displayName}
                            autoComplete="nickname"
                            disabled={registrationState === 'IN_PROGRESS'}
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
                            disabled={registrationState === 'IN_PROGRESS'}
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
                            disabled={registrationState === 'IN_PROGRESS'}
                            error={registrationError?.code === 'auth/weak-password' && t('auth.errors.weak-password')}
                        />
                    </InputContainer>
                    {registrationError &&
                        registrationError.code &&
                        registrationError.code !== 'auth/weak-password' &&
                        registrationError.code !== 'auth/email-already-in-use' && (
                            <ErrorBox>{registrationError.message}</ErrorBox>
                        )}
                    <ButtonContainer>
                        <Button type="button">{t('common.formNav.cancel')}</Button>
                        <Button primary disabled={disabled} type="submit">
                            {t('auth.register.title')}
                        </Button>
                    </ButtonContainer>
                </form>
            </SingleColumn>
        </>
    );
}
