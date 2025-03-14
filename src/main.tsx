import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Реєстрація Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker зареєстровано:', registration);
      })
      .catch(error => {
        console.error('Помилка реєстрації ServiceWorker:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
