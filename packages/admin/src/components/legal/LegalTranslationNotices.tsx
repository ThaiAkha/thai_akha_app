import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MergedLegalDocument } from '@thaiakha/shared/lib/mergeLegalTranslation';

interface LegalTranslationNoticesProps {
  document: MergedLegalDocument;
}

/**
 * Avvisi sulla lingua di un documento legale. Componente UNICO usato sia dalle pagine
 * agency sia dal modale di registrazione: sono le due schermate dove l'utente legge (e
 * accetta) il contratto, e devono dire le stesse cose. Tenerli separati li farebbe
 * divergere, ed e' proprio nel modale - dove si spunta la casella di consenso - che la
 * dichiarazione conta di piu'.
 *
 * ⚠️ I testi stanno nel namespace i18n `legal`, non qui. L'avviso di cortesia ha un solo
 * compito: dire al lettore che il testo che sta leggendo NON fa fede. Scritto in inglese
 * a chi legge in cinese, quel compito fallisce. Per questo va tradotto come tutto il
 * resto dell'interfaccia.
 *
 * Nota di copy: nelle stringhe non compare la lingua ("...while the TH translation is
 * completed"). Dirlo a chi sta gia' leggendo in thai e' ridondante, e in inglese la
 * lingua non e' nota in modo utile: firma unica in tutte e 4 le lingue.
 *
 * Non rende nulla quando si sta mostrando l'originale senza traduzione.
 */
const LegalTranslationNotices: React.FC<LegalTranslationNoticesProps> = ({ document: doc }) => {
  const { t } = useTranslation('legal');
  const showingTranslation = Boolean(doc.translationLang);

  if (!showingTranslation && !doc.isStaleTranslation) return null;

  return (
    <>
      {/* Traduzione di cortesia: non revisionata da un umano, l'inglese fa fede.
          Entrambi i documenti contengono una clausola di lingua in questo senso. */}
      {showingTranslation && (
        <div className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 px-4 py-3">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {t('courtesyNotice')}
          </p>
        </div>
      )}

      {/* Traduzione parziale: si dichiara PRIMA del testo, non dopo. */}
      {showingTranslation && doc.isPartialTranslation && (
        <div className="mb-6 rounded-2xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {t('partialNotice', { done: doc.translatedCount, total: doc.sections.length })}
          </p>
        </div>
      )}

      {/* La traduzione esisteva ma era riferita a una versione precedente: scartata. */}
      {doc.isStaleTranslation && (
        <div className="mb-6 rounded-2xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {t('staleNotice')}
          </p>
        </div>
      )}
    </>
  );
};

export default LegalTranslationNotices;
