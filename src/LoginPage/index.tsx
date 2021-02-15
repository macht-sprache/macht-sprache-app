import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router-dom';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { useUser } from '../hooks/auth';
import { addContinueParam, useContinuePath } from '../hooks/location';
import { REGISTER_POST } from '../routes';

export default function LoginPage() {
    const user = useUser();
    const { t } = useTranslation();
    const history = useHistory();
    const continuePath = useContinuePath();

    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<any>();

    if (user) {
        return <Redirect to={continuePath} />;
    }

    const disabled = loggingIn || !email || !password;

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setLoggingIn(true);
        setLoginError(undefined);
        auth.signInWithEmailAndPassword(email, password)
            .then(auth => {
                if (!auth.user?.emailVerified) {
                    history.push(addContinueParam(REGISTER_POST, continuePath));
                }
            })
            .catch(error => {
                setLoginError(error);
                setLoggingIn(false);
            });
    };

    return (
        <>
            <Header>{t('auth.login')}</Header>
            <form style={{ maxWidth: '500px' }} onSubmit={onSubmit}>
                <InputContainer>
                    <Input
                        label={t('auth.email')}
                        value={email}
                        autoComplete="email"
                        disabled={loggingIn}
                        onChange={value => {
                            setEmail(value.target.value);
                        }}
                        error={loginError?.code === 'auth/user-not-found' && t('auth.errors.user-not-found')}
                    />
                    <Input
                        label={t('auth.password')}
                        value={password}
                        autoComplete="current-password"
                        type="password"
                        disabled={loggingIn}
                        onChange={value => {
                            setSetPassword(value.target.value);
                        }}
                        error={loginError?.code === 'auth/wrong-password' && t('auth.errors.wrong-password')}
                    />
                </InputContainer>

                {loginError &&
                    loginError.code &&
                    loginError.code !== 'auth/user-not-found' &&
                    loginError.code !== 'auth/wrong-password' && <ErrorBox>{loginError.message}</ErrorBox>}
                <ButtonContainer>
                    <Button type="button">{t('common.formNav.cancel')}</Button>
                    <Button primary type="submit" disabled={disabled}>
                        {t('auth.login')}
                    </Button>
                </ButtonContainer>
            </form>
        </>
    );
}
