import React from 'react';
import ReactDOM from 'react-dom';
import './vars.css';
import './index.css';
import './tooltip.css';
import App from './App';
import { MatomoProvider, createInstance } from '@jonkoops/matomo-tracker-react';

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

ReactDOM.render(
    <React.StrictMode>
        <MatomoProvider value={instance}>
            <App />
        </MatomoProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
