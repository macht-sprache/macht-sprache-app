import { useState } from 'react';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';

export default function LoginPage() {
    const [userName, setUserName] = useState('');
    const [password, setSetPassword] = useState('');

    return (
        <>
            <Header>Login</Header>
            <div style={{ maxWidth: '500px' }}>
                <InputContainer>
                    <Input
                        label="Mail Address"
                        value={userName}
                        autoComplete="username"
                        onChange={value => {
                            setUserName(value.target.value);
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
                    <Button>Cancel</Button>
                    <Button primary={true}>Login</Button>
                </ButtonContainer>
            </div>
        </>
    );
}
