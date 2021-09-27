import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';
import { USER } from '../../routes';
import { UserMini } from '../../types';

export function UserInlineDisplay({ displayName, id }: UserMini) {
    return <Link to={generatePath(USER, { userId: id })}>{displayName}</Link>;
}
