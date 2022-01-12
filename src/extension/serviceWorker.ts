import './setup';
import browser from 'webextension-polyfill';
import { backgroundMessage } from './types';
import { analyzeText } from '../functions';

browser.runtime.onMessage.addListener((request: backgroundMessage, sender) => {
    console.log('message received');

    // return analyzeText(request.text, request.lang);
    return new Promise(resolve => {
        resolve('huhu!');
    });
});
