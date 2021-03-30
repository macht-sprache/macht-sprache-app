import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';
import { USER } from '../routes';

type UserInlineDisplayProps = {
    displayName: string;
    id: string;
};

export function UserInlineDisplay({ displayName, id }: UserInlineDisplayProps) {
    return <Link to={generatePath(USER, { userId: id })}>{displayName}</Link>;
}
