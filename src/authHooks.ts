import { useAuthState as _useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

export const useAuthState = () => _useAuthState(auth);
