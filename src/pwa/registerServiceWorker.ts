export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Project Zoe service worker registration failed:', error);
    });
  });
};
