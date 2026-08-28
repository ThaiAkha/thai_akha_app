import React from 'react';

export interface InspectorEmptyProps {
  icon: React.ReactNode;
  hint: string;
  /** Riga forte sopra l'hint: i 6 empty a due righe scritti a mano (Hotels, Storage, Logistic...). */
  title?: string;
  /** Wrapper attorno all'icona (es. tile arrotondata). Senza, l'icona resta nuda come oggi. */
  iconClassName?: string;
}

// Era grigio-300 in light, grigio-600 in dark, per giunta con opacity-60: 1.52 di
// contrasto, cioe' un messaggio che l'utente deve poter leggere reso quasi invisibile.
// `text-sub` e' AA in entrambi i temi e resta comunque piu' tenue del corpo.
export const InspectorEmpty: React.FC<InspectorEmptyProps> = ({ icon, hint, title, iconClassName }) => (
  <div className="h-full flex flex-col items-center justify-center text-sub space-y-2">
    {iconClassName ? <div className={iconClassName}>{icon}</div> : icon}
    {title && <span className="text-sm font-black uppercase tracking-widest">{title}</span>}
    <span className="text-xs font-medium">{hint}</span>
  </div>
);
