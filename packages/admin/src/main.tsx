// MUST be the first import: captures the password-recovery flag from the URL
// before the Supabase client (created transitively by ./App) consumes the hash.
import "./recovery-capture";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import 'react-phone-input-2/lib/style.css';
import 'country-flag-icons/3x2/flags.css';
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { I18nProvider } from "./context/I18nContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppWrapper>
            <App />
          </AppWrapper>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  </StrictMode>,
);
