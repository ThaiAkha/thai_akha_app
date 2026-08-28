import gb from '../../../assets/flags/gb.svg';
import th from '../../../assets/flags/th.svg';
import es from '../../../assets/flags/es.svg';
import cn from '../../../assets/flags/cn.svg';

/**
 * 🏴 Flag — bandiera SVG locale (cross-platform, niente emoji).
 * Aggiungere una bandiera = droppare lo SVG in `assets/flags/` e mapparlo qui.
 * Se il country non è mappato, mostra il codice in un chip (fallback elegante).
 */
const FLAG_SRC: Record<string, string> = { gb, th, es, cn };

interface FlagProps {
  country: string;
  className?: string;
}

export default function Flag({ country, className = 'w-6 h-4' }: FlagProps) {
  const src = FLAG_SRC[country];
  const base = `inline-block shrink-0 rounded-[3px] object-cover ring-1 ring-black/5 dark:ring-white/10 ${className}`;

  if (!src) {
    return (
      <span
        className={`${base} flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-xs font-black uppercase text-sub`}
        aria-hidden="true"
      >
        {country}
      </span>
    );
  }
  return <img src={src} alt="" aria-hidden="true" className={base} />;
}
