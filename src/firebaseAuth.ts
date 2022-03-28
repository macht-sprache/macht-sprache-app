import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);
if (process.env.REACT_APP_AUTH_EMULATOR_PORT) {
    connectAuthEmulator(auth, `http://${window.location.hostname}:${process.env.REACT_APP_AUTH_EMULATOR_PORT}`);
}

export { auth };
