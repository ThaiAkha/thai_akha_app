import React from 'react';
import { Phone, Mail, MessageCircle, MessageSquare } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * ContactLinks — blocco contatti riusabile (phone · agency phone · email · LINE) per gli
 * header leader della colonna destra. Markup unico al posto delle 3+ copie sparse.
 */
export interface ContactLinksProps {
  phone?: string | null;
  agencyPhone?: string | null;
  email?: string | null;
  lineId?: string | null;
  /** Se fornito, mostra l'azione WhatsApp accanto al telefono. */
  onWhatsApp?: (phone: string) => void;
  /** Testo quando non c'è alcun contatto (default: nasconde il blocco). */
  emptyLabel?: string;
  className?: string;
}

const ROW = 'inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors w-fit min-w-0';

const ContactLinks: React.FC<ContactLinksProps> = ({
  phone,
  agencyPhone,
  email,
  lineId,
  onWhatsApp,
  emptyLabel,
  className,
}) => {
  const hasAny = !!(phone || agencyPhone || email || lineId);
  if (!hasAny) {
    return emptyLabel ? <div className={cn('text-xs italic text-gray-400', className)}>{emptyLabel}</div> : null;
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {phone && (
        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`} className={ROW}>
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{phone}</span>
          </a>
          {onWhatsApp && (
            <button
              type="button"
              onClick={() => onWhatsApp(phone)}
              aria-label="WhatsApp"
              className="text-green-600 dark:text-green-500 hover:opacity-70 transition-opacity shrink-0"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      {agencyPhone && (
        <a href={`tel:${agencyPhone}`} className={ROW}>
          <Phone className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">{agencyPhone}</span>
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={ROW}>
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{email}</span>
        </a>
      )}
      {lineId && (
        <span className={ROW}>
          <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
          <span className="truncate">{lineId}</span>
        </span>
      )}
    </div>
  );
};

export default ContactLinks;
