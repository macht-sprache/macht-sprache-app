import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button, { ButtonContainer } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { SimpleHeader } from '../Header';
import { useLogin } from '../hooks/auth';
import { addContinueParam, useContinuePath } from '../hooks/location';
import { SingleColumn } from '../Layout/Columns';
import { FORGOT_PASSWORD } from '../routes';

export default function LoginPage() {
    const { t } = useTranslation();
    const continuePath = useContinuePath();
    const { login, loginState, loginError } = useLogin(continuePath);

    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');

    const disabled = loginState === 'IN_PROGRESS' || !email || !password;

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        login(email, password);
    };

    return (
        <>
            <SimpleHeader>{t('auth.login')}</SimpleHeader>
            <SingleColumn>
                <form onSubmit={onSubmit}>
                    <InputContainer>
                        <Input
                            label={t('auth.email')}
                            value={email}
                            autoComplete="email"
                            disabled={loginState === 'IN_PROGRESS'}
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
                            disabled={loginState === 'IN_PROGRESS'}
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
                    <p>
                        <Link to={addContinueParam(FORGOT_PASSWORD, continuePath)}>
                            {t('auth.passwordReset.requestLabel')}
                        </Link>
                    </p>
                    <ButtonContainer>
                        <Button primary type="submit" disabled={disabled}>
                            {t('auth.login')}
                        </Button>
                    </ButtonContainer>
                </form>
            </SingleColumn>
        </>
    );
}
