import Header from '../../components/Header';
import { SingleColumn } from '../../components/Layout/Columns';
import TextChecker from '../../components/TextChecker';

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
