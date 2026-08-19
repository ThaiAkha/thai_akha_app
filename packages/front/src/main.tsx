
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AppQueryProvider } from '@thaiakha/shared/query';
import { LanguageProvider } from './context/LanguageContext';
import { initI18n } from './i18n';
import { parseLangPath } from './lib/langRouting';
import './styles/index.css';

// i18next parte PRIMA del primo render, con la lingua dell'URL: i namespace di
// shell (common/nav/errors/components) sono bundlati in inglese, quindi il
// primo paint non mostra mai chiavi grezze; il resto si carica per lingua.
void initI18n(parseLangPath(window.location.pathname).lang);

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
      {/* Data layer unico (#86): un QueryClient per l'app, sopra tutto cio' che legge da Supabase. */}
      <AppQueryProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AppQueryProvider>
    </React.StrictMode>
  );
}
