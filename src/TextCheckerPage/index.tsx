import Header from '../Header';
import { SingleColumn } from '../Layout/Columns';
import TextChecker from '../TextChecker';

export default function TextCheckerPage() {
    return (
        <>
            <Header subLine="Get help with sensitive translations">Text checker</Header>
            <SingleColumn>
                <TextChecker />
            </SingleColumn>
        </>
    );
}
