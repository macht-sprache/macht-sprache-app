import { useState } from 'react';
import Header from '../Header';
import { SingleColumn } from '../Layout/Columns';
import TextCheckerEntry from '../TextChecker/TextCheckerEntry';
import TextCheckerResult from '../TextChecker/TextCheckerResult';

export default function TextCheckerPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    return (
        <>
            <Header subLine="Get help with sensitive translations">Text checker</Header>
            <SingleColumn>
                {isSubmitted ? (
                    <TextCheckerResult
                        onCancel={() => {
                            setIsSubmitted(false);
                        }}
                    />
                ) : (
                    <TextCheckerEntry
                        onSubmit={() => {
                            setIsSubmitted(true);
                        }}
                    />
                )}{' '}
            </SingleColumn>
        </>
    );
}
