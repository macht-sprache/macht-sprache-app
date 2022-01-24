import { generatePath } from 'react-router';
import { USER } from '../../routes';
import { UserMini } from '../../types';
import Link from '../Link';

export function UserInlineDisplay({ displayName, id }: UserMini) {
    return <Link to={generatePath(USER, { userId: id })}>{displayName}</Link>;
}
