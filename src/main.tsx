import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { FONT_CSS } from './fonts';
import './styles.css';

const fonts = document.createElement('style');
fonts.textContent = FONT_CSS;
document.head.append(fonts);
const root = document.getElementById('root');
if (!root) throw new Error('Root element missing.');
createRoot(root).render(<StrictMode><App /></StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD && location.protocol.startsWith('http') && document.querySelector('link[rel="manifest"]')) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
  });
}
