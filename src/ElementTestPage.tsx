import { useState } from 'react';
import Button from './Form/Button';
import { Input, Select } from './Form/Input';
import InputContainer from './Form/InputContainer';
import Header from './Header';

export default function ElementTestPage() {
    const [selectValue, setSelectValue] = useState('');

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
            </InputContainer>
        </>
    );
}
