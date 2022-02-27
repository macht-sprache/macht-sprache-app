import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

const appConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT}.firebaseapp.com`,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT,
    storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT}.appspot.com`,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const emulatorHost = process.env.REACT_APP_EMULATOR_HOST || window.location.hostname;

const app = firebase.initializeApp(appConfig);
const db = app.firestore();
const functions = getFunctions(app, process.env.REACT_APP_FIREBASE_REGION);

if (process.env.REACT_APP_FIRESTORE_EMULATOR_PORT) {
    db.useEmulator(emulatorHost, parseInt(process.env.REACT_APP_FIRESTORE_EMULATOR_PORT));
}

if (process.env.REACT_APP_FUNCTIONS_EMULATOR_PORT) {
    connectFunctionsEmulator(functions, emulatorHost, parseInt(process.env.REACT_APP_FUNCTIONS_EMULATOR_PORT));
}

const Timestamp = firebase.firestore.Timestamp;

export { app, db, functions, Timestamp };
