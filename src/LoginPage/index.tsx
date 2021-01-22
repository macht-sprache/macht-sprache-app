import { FormEventHandler, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuthState } from '../authHooks';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');
    const [user, loading] = useAuthState();

    if (user) {
        return <Redirect to="/" />;
    }

    const disabled = loading || !email || !password;

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        auth.signInWithEmailAndPassword(email, password).catch(error => console.error(error));
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
