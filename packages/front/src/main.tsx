
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext';
import './styles/index.css';

// Verifica caricamento in console
console.log('%c Thai Akha Kitchen: Tailwind CSS Loaded kha! ', 'background: #98C93C; color: #fff; font-weight: bold;');

const updateVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

updateVH();
window.addEventListener('resize', updateVH);
window.addEventListener('orientationchange', updateVH);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* La lingua è la prima cosa che si decide: sta sopra a tutto, perché
          App, SEOHead e ogni pagina leggono da qui quale lingua servire. */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </React.StrictMode>
  );
}
