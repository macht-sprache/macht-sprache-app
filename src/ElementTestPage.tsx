import firebase from 'firebase/app';
import { useState } from 'react';
import BookSearch from './BookSearch';
import { CommentCreate } from './Comments/CommentCreate';
import { CommentList } from './Comments/CommentList';
import { CommentWrapper } from './Comments/CommentWrapper';
import Button, { ButtonContainer } from './Form/Button';
import { Input, Select, Textarea } from './Form/Input';
import InputContainer from './Form/InputContainer';
import Header from './Header';
import { collections } from './hooks/data';
import { MultiStepIndicator, MultiStepIndicatorStep } from './MultiStepIndicator';
import { RatingWidget } from './Rating/RatingWidget';
import { Book, Comment } from './types';

const ref = collections.terms.doc('1');
const creator = {
    id: 'timur',
    displayName: 'timur',
};

export default function ElementTestPage() {
    const [name, setName] = useState('');
    const [another, setAnother] = useState('Disabled value');
    const [selectValue, setSelectValue] = useState('');
    const [anotherSelectValue, setAnotherSelectValue] = useState('2');
    const [textAreaValue, setTextAreaValue] = useState('');
    const [book, setBook] = useState<Book>();
    const [rating, setRating] = useState(2);

    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            ref,
            creator,
            comment: 'This is a very short comment.',
            createdAt: firebase.firestore.Timestamp.fromDate(
                new Date('Mon Jan 25 2021 17:29:26 GMT+0100 (Central European Standard Time)')
            ),
        },
        {
            id: '2',
            ref,
            creator: {
                id: 'anna',
                displayName: 'Anne with a rather long user name for some reason',
            },
            comment: 'Yep.',
            createdAt: firebase.firestore.Timestamp.fromDate(
                new Date('Mon Jan 25 2021 12:20:26 GMT+0100 (Central European Standard Time)')
            ),
        },
        {
            id: '3',
            ref,
            creator: {
                id: 'lucy',
                displayName: 'Lucy',
            },
            comment: `In linguistics, the topic, or theme, of a sentence is what is being talked about, and the comment (rheme or focus) is what is being said about the topic. This division into old vs. new content is called information structure. It is generally agreed that clauses are divided into topic vs. comment, but in certain cases the boundary between them depends on which specific grammatical theory is being used to analyze the sentence.
            Topic, which is defined by pragmatic considerations, is a distinct concept from grammatical subject, which is defined by syntax. In any given sentence these may be the same, but they need not be. For example, in the sentence "As for the little girl, the dog bit her", the subject is "the dog" but the topic is "the little girl".`,
            createdAt: firebase.firestore.Timestamp.fromDate(
                new Date('Mon Jan 24 2021 17:29:26 GMT+0100 (Central European Standard Time)')
            ),
        },
    ]);

    const onCreate = async (comment: string) => {
        setComments(existingComments => [
            ...existingComments,
            {
                id: (existingComments.length + 1).toString(),
                ref,
                creator,
                comment,
                createdAt: firebase.firestore.Timestamp.now(),
            },
        ]);
    };

    return (
        <>
            <Header>Element Test Page</Header>
            <Heading>Rating Widget</Heading>
            <p>Without user rating</p>
            <RatingWidget termValue="Indianer" lang="de" ratings={[5, 2, 0, 12, 21]} />
            <p>With user rating</p>
            <RatingWidget
                lang="de"
                termValue="Indianer"
                ratings={[5, 2, 0, 12, 21]}
                rangeInputProps={{
                    value: rating,
                    onChange: e => {
                        setRating(e.currentTarget.value);
                    },
                }}
            />

            <Heading>Button</Heading>
            <Button>button</Button>
            <Heading>Primary Button</Heading>
            <Button primary={true}>button</Button>
            <Heading>Button Disabled</Heading>
            <Button disabled>button</Button>

            <Heading>Form</Heading>
            <InputContainer>
                <Input
                    label="Name"
                    span={2}
                    value={name}
                    onChange={value => {
                        setName(value.target.value);
                    }}
                    error="something is wrong here!"
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
                <Select
                    label="Another Select, full width & disabled"
                    value={anotherSelectValue}
                    disabled={true}
                    onChange={value => {
                        setAnotherSelectValue(value.target.value);
                    }}
                >
                    <option value=""></option>
                    <option value="1">book</option>
                    <option value="2">newspaper</option>
                    <option value="3">movie</option>
                </Select>
                <Input
                    label="Another field, busy"
                    // busy={true}
                    value={another}
                    onChange={value => {
                        setAnother(value.target.value);
                    }}
                />
                <Input
                    label="Another field, disabled"
                    disabled={true}
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
                    maxLength={100}
                />
            </InputContainer>
            <ButtonContainer>
                <Button>Cancel</Button>
                <Button primary={true}>Submit</Button>
            </ButtonContainer>

            <Heading>Comments</Heading>

            <CommentWrapper>
                <CommentList comments={comments} />
                <CommentCreate onCreate={onCreate} />
            </CommentWrapper>

            <Heading>Multi Step Indicator</Heading>
            <MultiStepIndicator>
                <MultiStepIndicatorStep>First thing</MultiStepIndicatorStep>
                <MultiStepIndicatorStep active={true}>Second</MultiStepIndicatorStep>
                <MultiStepIndicatorStep>another one</MultiStepIndicatorStep>
            </MultiStepIndicator>

            <Heading>Book Search</Heading>
            <BookSearch label="Find German Books" lang="de" selectedBook={book} onSelect={setBook} />
            <p />
            <BookSearch label="Find English Books" lang="en" />
        </>
    );
}

function Heading({ children }: { children: React.ReactNode }) {
    return <h2 style={{ marginTop: '3rem' }}>{children}</h2>;
}
