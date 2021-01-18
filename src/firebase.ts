import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const appConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT}.firebaseapp.com`,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT,
    storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT}.appspot.com`,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = firebase.initializeApp(appConfig);
const auth = app.auth();
const db = app.firestore();

if (process.env.REACT_APP_AUTH_EMULATOR_PORT) {
    auth.useEmulator(window.location.origin.replace(window.location.port, process.env.REACT_APP_AUTH_EMULATOR_PORT));
}

if (process.env.REACT_APP_FIRESTORE_EMULATOR_PORT) {
    db.useEmulator(window.location.hostname, parseInt(process.env.REACT_APP_FIRESTORE_EMULATOR_PORT));
}

export { auth, db };
