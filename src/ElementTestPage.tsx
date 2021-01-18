import Button from './Form/Button';
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
        </>
    );
}
