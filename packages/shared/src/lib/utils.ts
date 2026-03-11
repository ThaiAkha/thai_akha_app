
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility per unire classi CSS in modo condizionale e risolvere conflitti di Tailwind.
 * Combina 'clsx' per la logica condizionale e 'tailwind-merge' per garantire che
 * le classi di utility (es. padding o colori) vengano sovrascritte correttamente.
 * 
 * @param inputs - Classi o oggetti condizionali (es: "p-4", isActive && "bg-brand-500")
 * @returns Una stringa pulita di classi CSS ottimizzata per Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
