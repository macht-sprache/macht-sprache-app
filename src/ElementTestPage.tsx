import { useState } from 'react';
import { CommentCreate } from './Comments/CommentCreate';
import { CommentList } from './Comments/CommentList';
import { CommentWrapper } from './Comments/CommentWrapper';
import Button from './Form/Button';
import { Input, Select, Textarea } from './Form/Input';
import InputContainer from './Form/InputContainer';
import Header from './Header';

export default function ElementTestPage() {
    const [name, setName] = useState('');
    const [another, setAnother] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [textAreaValue, setTextAreaValue] = useState('');

    const [comments, setComments] = useState([
        {
            creator: 'timur',
            comment: 'This is a very short comment.',
            date: new Date('Mon Jan 25 2021 17:29:26 GMT+0100 (Central European Standard Time)'),
        },
        {
            creator: 'Anne with a rather long user name for some reason',
            comment: 'Yep.',
            date: new Date('Mon Jan 25 2021 12:20:26 GMT+0100 (Central European Standard Time)'),
        },
        {
            creator: 'Lucy',
            comment: `In linguistics, the topic, or theme, of a sentence is what is being talked about, and the comment (rheme or focus) is what is being said about the topic. This division into old vs. new content is called information structure. It is generally agreed that clauses are divided into topic vs. comment, but in certain cases the boundary between them depends on which specific grammatical theory is being used to analyze the sentence.
            Topic, which is defined by pragmatic considerations, is a distinct concept from grammatical subject, which is defined by syntax. In any given sentence these may be the same, but they need not be. For example, in the sentence "As for the little girl, the dog bit her", the subject is "the dog" but the topic is "the little girl".`,
            date: new Date('Mon Jan 24 2021 17:29:26 GMT+0100 (Central European Standard Time)'),
        },
    ]);

    const [newComment, setNewComment] = useState('');

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setComments([
            ...comments,
            {
                creator: 'Timur',
                date: new Date(),
                comment: newComment,
            },
        ]);
        setNewComment('');
    };

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

            <h2>Comments</h2>

            <CommentWrapper>
                <CommentList comments={comments} />
                <CommentCreate onSubmit={onSubmit} newComment={newComment} setNewComment={setNewComment} />
            </CommentWrapper>
        </>
    );
}
