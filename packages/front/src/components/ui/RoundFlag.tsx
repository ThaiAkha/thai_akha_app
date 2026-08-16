import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { SupportedLang } from '@thaiakha/shared/lib/i18n';

// SVG circle-flags (HatScripts, MIT) — committati in assets/flags, self-host
// come le bandiere dell'admin (components/ui/flags): niente CDN a runtime,
// niente emoji (su Windows le emoji-bandiera non renderizzano affatto).
import flagGb from '../../assets/flags/gb.svg';
import flagEs from '../../assets/flags/es.svg';
import flagFr from '../../assets/flags/fr.svg';
import flagDe from '../../assets/flags/de.svg';
import flagPt from '../../assets/flags/pt.svg';
import flagIt from '../../assets/flags/it.svg';
import flagCt from '../../assets/flags/es-ct.svg';
import flagNl from '../../assets/flags/nl.svg';
import flagTh from '../../assets/flags/th.svg';
import flagCn from '../../assets/flags/cn.svg';
import flagKr from '../../assets/flags/kr.svg';
import flagJp from '../../assets/flags/jp.svg';

/**
 * 🏁 RoundFlag — bandierina circolare a "pillola 3D".
 *
 * Le lingue NON sono paesi: questa mappa è una scelta editoriale, presa una
 * volta sola qui. en→Regno Unito, ca→senyera catalana (es-ct), zh→Cina,
 * ko→Corea del Sud. Aggiungere una lingua = droppare lo SVG in assets/flags
 * e una riga qui — stesso patto del Flag.tsx admin.
 *
 * Accessibilità: la bandiera è SEMPRE decorativa (aria-hidden). Il nome della
 * lingua lo porta il testo o l'aria-label del bottone che la contiene — mai
 * affidare il significato alla sola bandiera.
 */
const FLAG_SRC: Record<SupportedLang, string> = {
  en: flagGb,
  es: flagEs,
  fr: flagFr,
  de: flagDe,
  pt: flagPt,
  it: flagIt,
  ca: flagCt,
  nl: flagNl,
  th: flagTh,
  zh: flagCn,
  ko: flagKr,
  ja: flagJp,
};

interface RoundFlagProps {
  lang: SupportedLang;
  /** Evidenzia la lingua attiva (anello lime, idioma interattivo della sidebar). */
  active?: boolean;
  /** Dimensione via classi (default 44px = bersaglio touch pieno). */
  sizeClass?: string;
  className?: string;
}

export const RoundFlag: React.FC<RoundFlagProps> = ({
  lang,
  active = false,
  sizeClass = 'w-11 h-11',
  className,
}) => (
  <span
    className={cn(
      'relative inline-block shrink-0 rounded-full',
      sizeClass,
      // Profondità esterna: ombra morbida sotto la pillola.
      'shadow-[0_2px_6px_rgba(0,0,0,0.25)]',
      active
        ? 'ring-2 ring-action-500 ring-offset-2 ring-offset-surface'
        : 'ring-1 ring-black/15',
      className,
    )}
  >
    <img
      src={FLAG_SRC[lang]}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="h-full w-full rounded-full object-cover select-none"
    />
    {/* Calotta 3D: highlight in alto + ombra interna in basso. Solo CSS,
        nessuna libreria — è un overlay non interattivo sopra lo SVG. */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-full
                 shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-3px_5px_rgba(0,0,0,0.28)]"
    />
  </span>
);

export default RoundFlag;
