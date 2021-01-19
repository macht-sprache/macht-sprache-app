import Button from './Form/Button';
import Input from './Form/Input';
import InputContainer from './Form/InputContainer';
import Header from './Header';

export default function ElementTestPage() {
    return (
        <>
            <Header>Element Test Page</Header>
            <h2>Button</h2>
            <Button>button</Button>
            <h2>Primary Button</h2>
            <Button primary={true}>button</Button>
            <h2>Button Disabled</h2>
            <Button disabled>button</Button>

            <h2>Form</h2>
            <InputContainer>
                <Input label="Name" span={2} />
                <Input label="Email" span={2} />
                <Input label="Another field" />
            </InputContainer>
        </>
    );
}
