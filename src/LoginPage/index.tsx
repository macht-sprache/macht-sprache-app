import { FormEventHandler, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { useUser } from '../authHooks';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { HOME, REGISTER_POST } from '../routes';

export default function LoginPage() {
    const user = useUser();
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    if (user) {
        return <Redirect to={HOME} />;
    }

    const disabled = loggingIn || !email || !password;

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setLoggingIn(true);
        auth.signInWithEmailAndPassword(email, password)
            .then(auth => {
                if (!auth.user?.emailVerified) {
                    history.push(REGISTER_POST);
                }
            })
            .catch(error => {
                console.error(error);
                setLoggingIn(false);
            });
    };

    return (
        <>
            <Header>Login</Header>
            <form style={{ maxWidth: '500px' }} onSubmit={onSubmit}>
                <InputContainer>
                    <Input
                        label="Mail Address"
                        value={email}
                        autoComplete="email"
                        onChange={value => {
                            setEmail(value.target.value);
                        }}
                    />
                    <Input
                        label="Password"
                        value={password}
                        autoComplete="current-password"
                        type="password"
                        onChange={value => {
                            setSetPassword(value.target.value);
                        }}
                    />
                </InputContainer>
                <ButtonContainer>
                    <Button type="button">Cancel</Button>
                    <Button primary type="submit" disabled={disabled}>
                        Login
                    </Button>
                </ButtonContainer>
            </form>
        </>
    );
}
