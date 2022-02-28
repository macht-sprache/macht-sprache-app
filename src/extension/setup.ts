import browser from 'webextension-polyfill';

__webpack_public_path__ = browser.runtime.getURL('dist/');

// Fixes an issue in Firefox when calling getComputedStyle in a content script
// https://github.com/adobe/react-spectrum/blob/1e2b7f280a04ead83e21b27fa580eb189e5f4186/packages/%40react-aria/focus/src/isElementVisible.ts#L27
window.getComputedStyle = window.getComputedStyle.bind(window);
