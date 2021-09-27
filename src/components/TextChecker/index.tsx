import { useState } from 'react';
import TextCheckerEntry from './TextCheckerEntry';
import TextCheckerResult from './TextCheckerResult';

export default function TextChecker() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    return (
        <>
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
            )}
        </>
    );
}
