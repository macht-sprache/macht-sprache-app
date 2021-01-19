import { useState } from 'react';
import Button from './Form/Button';
import { Input, Select, Textarea } from './Form/Input';
import InputContainer from './Form/InputContainer';
import Header from './Header';

export default function ElementTestPage() {
    const [name, setName] = useState('');
    const [another, setAnother] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [textAreaValue, setTextAreaValue] = useState('');

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
                <Input
                    label="Name"
                    span={2}
                    value={name}
                    onChange={value => {
                        setName(value.target.value);
                    }}
                />
                <Select
                    label="Media Type"
                    span={2}
                    value={selectValue}
                    onChange={value => {
                        setSelectValue(value.target.value);
                    }}
                >
                    <option value=""></option>
                    <option value="1">book</option>
                    <option value="2">newspaper</option>
                    <option value="3">movie</option>
                </Select>
                <Input
                    label="Another field, full width"
                    value={another}
                    onChange={value => {
                        setAnother(value.target.value);
                    }}
                />
                <Textarea
                    label="Comment"
                    value={textAreaValue}
                    onChange={value => {
                        setTextAreaValue(value.target.value);
                    }}
                />
            </InputContainer>
        </>
    );
}
