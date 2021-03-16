import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import Button, { ButtonContainer, ButtonLink } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { useUser } from '../hooks/appContext';
import { useLogin } from '../hooks/auth';
import { addContinueParam, useContinuePath } from '../hooks/location';
import { SingleColumn } from '../Layout/Columns';
import { FORGOT_PASSWORD } from '../routes';

export default function LoginPage() {
    const user = useUser();
    const { t } = useTranslation();
    const continuePath = useContinuePath();
    const login = useLogin();

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
        login(email, password, continuePath).catch(error => {
            setLoginError(error);
            setLoggingIn(false);
        });
    };

    return (
        <>
            <Header>{t('auth.login')}</Header>
            <SingleColumn>
                <form onSubmit={onSubmit}>
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
                        <ButtonLink to={addContinueParam(FORGOT_PASSWORD, continuePath)}>
                            {t('auth.passwordReset.requestLabel')}
                        </ButtonLink>
                        <Button primary type="submit" disabled={disabled}>
                            {t('auth.login')}
                        </Button>
                    </ButtonContainer>
                </form>
            </SingleColumn>
        </>
    );
}
