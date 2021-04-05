/// <reference types="react/experimental" />
/// <reference types="react-dom/experimental" />

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './tooltip.css';
import App from './App';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';

const instance = createInstance({
    urlBase: 'https://piwik.volligohne.de/',
    siteId: 4,
    disabled: process.env.NODE_ENV === 'development',
    linkTracking: false,
    configurations: {
        disableCookies: true,
        setRequestMethod: 'POST',
    },
});

ReactDOM.unstable_createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MatomoProvider value={instance}>
            <App />
        </MatomoProvider>
    </React.StrictMode>
);
