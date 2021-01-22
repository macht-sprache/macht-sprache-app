import { FormEventHandler, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Redirect } from 'react-router-dom';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';

export default function RegisterPage() {
    const [displayName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setSetPassword] = useState('');
    const [loadingRegistration, setLoadingRegistration] = useState(false);

    const [user, loadingAuthState] = useAuthState(auth);

    const disabled = loadingRegistration || loadingAuthState || !displayName || !email || !password;

    if (user) {
        return <Redirect to="/" />;
    }

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setLoadingRegistration(true);
        auth.createUserWithEmailAndPassword(email, password)
            .then(({ user }) => user?.updateProfile({ displayName }))
            .catch(error => console.error(error))
            .finally(() => setLoadingRegistration(false));
    };

    return (
        <>
            <Header>Sign Up</Header>
            <form style={{ maxWidth: '500px' }} onSubmit={onSubmit}>
                <InputContainer>
                    <Input
                        label="User Name"
                        value={displayName}
                        onChange={event => {
                            setUserName(event.target.value);
                        }}
                    />
                    <Input
                        label="Mail Address"
                        value={email}
                        type="email"
                        autoComplete="email"
                        onChange={event => {
                            setEmail(event.target.value);
                        }}
                    />
                    <Input
                        label="Password"
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
                        Sign Up
                    </Button>
                </ButtonContainer>
            </form>
        </>
    );
}
