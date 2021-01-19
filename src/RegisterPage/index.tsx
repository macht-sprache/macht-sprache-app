import { useState } from 'react';
import Button, { ButtonContainer } from '../Form/Button';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';

export default function RegisterPage() {
    const [userName, setUserName] = useState('');
    const [mail, setMail] = useState('');
    const [password, setSetPassword] = useState('');

    return (
        <>
            <Header>Sign Up</Header>
            <div style={{ maxWidth: '500px' }}>
                <InputContainer>
                    <Input
                        label="User Name"
                        value={userName}
                        onChange={value => {
                            setUserName(value.target.value);
                        }}
                    />
                    <Input
                        label="Mail Address"
                        value={mail}
                        type="email"
                        onChange={value => {
                            setMail(value.target.value);
                        }}
                    />
                    <Input
                        label="Password"
                        value={password}
                        type="password"
                        onChange={value => {
                            setSetPassword(value.target.value);
                        }}
                    />
                </InputContainer>
                <ButtonContainer>
                    <Button>Cancel</Button>
                    <Button primary={true}>Sign Up</Button>
                </ButtonContainer>
            </div>
        </>
    );
}
