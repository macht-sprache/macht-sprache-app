import { createInstance, MatomoProvider } from '@jonkoops/matomo-tracker-react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './tooltip.css';
import './vars.css';

const matomoInstance = createInstance({
    urlBase: 'https://piwik.volligohne.de/',
    siteId: 4,
    disabled: process.env.NODE_ENV === 'development',
    linkTracking: false,
    configurations: {
        disableCookies: true,
        setRequestMethod: 'POST',
    },
});

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <MatomoProvider value={matomoInstance}>
            <App />
        </MatomoProvider>
    </React.StrictMode>
);
