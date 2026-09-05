import React, { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { RoundFlag } from '../ui/RoundFlag';
import { useLanguage } from '../../context/LanguageContext';
import type { SupportedLang } from '@thaiakha/shared/lib/i18n';

/**
 * 🌍 SWITCHER LINGUA — due forme, un solo comportamento.
 *
 * `LanguageFlagPanel` (desktop) — pannello flottante FUORI dalla sidebar,
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

// ─── Pannello desktop ─────────────────────────────────────────────────────────

interface LanguageFlagPanelProps {
  open: boolean;
  onClose: () => void;
  /** Elemento a cui ancorarsi (il bottone "Languages" della sidebar). */
  anchorRef: React.RefObject<HTMLElement | null>;
}

export const LanguageFlagPanel: React.FC<LanguageFlagPanelProps> = ({
  open,
  onClose,
  anchorRef,
}) => {
  const { lang, availableLangs, labels, switchLang } = useLanguage();
  const [coords, setCoords] = useState({ left: 0, bottom: 0 });
  const [hovered, setHovered] = useState<SupportedLang | null>(null);

  // Ancoraggio: a destra del bottone, allineato in basso (il bottone sta nel
  // footer della sidebar → il pannello cresce verso l'alto e resta in viewport).
  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({
      left: rect.right + 16,
      bottom: Math.max(16, window.innerHeight - rect.bottom),
    });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Una lingua sola = nessuna scelta da offrire (flag i18n spento).
  if (availableLangs.length < 2) return null;

  const handlePick = (next: SupportedLang) => {
    onClose();
    switchLang(next);
  };

  // La didascalia mostra la lingua sotto il cursore, altrimenti quella attiva:
  // le pillole sono compatte, il nome per esteso vive qui sotto.
  const caption = hovered ?? lang;

  return createPortal(
    // MotionConfig reducedMotion="user": chi ha "riduci movimento" attivo nel
    // sistema ottiene dissolvenze al posto delle molle — la scenografia è un
    // regalo, non un requisito.
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop trasparente: chiude su click fuori senza scurire la pagina. */}
            <motion.div
              key="lang-backdrop"
              className="fixed inset-0 z-[59]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              key="lang-panel"
              role="listbox"
              aria-label="Select language"
              className="fixed z-[60] rounded-3xl border border-border bg-surface/90 backdrop-blur-xl
                         shadow-2xl [padding:var(--space-fluid-s)]"
              style={{ left: coords.left, bottom: coords.bottom }}
              initial={{ opacity: 0, x: -16, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex flex-wrap justify-center [gap:var(--space-fluid-xs)]">
                {availableLangs.map((code, i) => (
                  <motion.button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={code === lang}
                    aria-label={labels[code]}
                    lang={code}
                    onClick={() => handlePick(code)}
                    onMouseEnter={() => setHovered(code)}
                    onFocus={() => setHovered(code)}
                    className="group flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full
                               outline-none focus-visible:ring-2 focus-visible:ring-action-500"
                    // Entrata scenografica: ogni bandierina sboccia dal bottone
                    // (scale+x) con 40ms di scarto dalla precedente.
                    initial={{ opacity: 0, scale: 0.3, x: -24 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 26,
                      delay: i * 0.04,
                    }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <RoundFlag lang={code} active={code === lang} />
                  </motion.button>
                ))}
              </div>

              {/* Didascalia: nome nativo della lingua puntata (o attiva). */}
              <div
                className="flex items-center justify-center [margin-top:var(--space-fluid-xs)]"
                aria-hidden="true"
              >
                <Typography variant="microLabel" color="sub" as="span" lang={caption}>
                  {labels[caption]}
                </Typography>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body,
  );
};

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
