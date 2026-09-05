import React from 'react';
import { Check } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { RoundFlag } from '../ui/RoundFlag';
import { useLanguage } from '../../context/LanguageContext';

/**
 * 🌍 SWITCHER LINGUA — due forme, un solo comportamento.
 *
 * `LanguageFlagPanel` (desktop, file LanguageFlagPanel.tsx) — pannello flottante FUORI dalla sidebar,
 *   ancorato al bottone "Languages": le 12 bandierine-pillola entrano in
 *   sequenza (spring staggerato, sbocciano dal bottone verso destra).
 *   Portal su body, come Tooltip: la sidebar ha il suo stacking context e il
 *   pannello deve viverne fuori.
 *
 * `LanguageSwitcher` (mobile) — righe piene nel pannello Settings: dentro un
 *   foglio che già scorre, un secondo scroll annidato è la cosa più scomoda
 *   da usare col pollice.
 *
 * In entrambe: cambio lingua MANTENENDO la pagina (slug rimappato dal
 * registro), bandiera sempre accompagnata dall'etichetta NATIVA (Deutsch,
 * 日本語) — chi cerca la propria lingua la riconosce scritta come la scrive
 * lui, e la bandiera da sola non è un'informazione accessibile.
 *
 * A flag i18n SPENTO c'è una sola lingua attiva → nessuno dei due renderizza:
 * oggi l'app resta identica a prima.
 */

// ─── Lista mobile ─────────────────────────────────────────────────────────────

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, availableLangs, labels, switchLang } = useLanguage();

  if (availableLangs.length < 2) return null;

  return (
    <ul
      role="listbox"
      aria-label="Select language"
      className={`flex flex-col [gap:var(--space-fluid-2xs)] ${className}`}
    >
      {availableLangs.map((code) => {
        const isCurrent = code === lang;
        return (
          <li key={code}>
            <button
              type="button"
              role="option"
              aria-selected={isCurrent}
              lang={code}
              onClick={() => switchLang(code)}
              className={`flex w-full items-center min-h-[44px] rounded-2xl text-start
                          transition-colors duration-150
                          hover:bg-surface-2 focus-visible:outline-none focus-visible:bg-surface-2
                          [gap:var(--space-fluid-s)] [padding-inline:var(--space-fluid-xs)]
                          ${isCurrent ? 'bg-surface-2' : ''}`}
            >
              <RoundFlag lang={code} active={isCurrent} sizeClass="w-7 h-7" />
              <Typography
                variant="paragraphS"
                color={isCurrent ? 'title' : 'sub'}
                as="span"
                className="flex-1"
              >
                {labels[code]}
              </Typography>
              {isCurrent && <Check size={16} aria-hidden="true" className="text-action-600" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default LanguageSwitcher;
