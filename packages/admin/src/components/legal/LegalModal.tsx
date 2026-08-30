import React from 'react';
import { Modal } from '../ui/modal';
import type { MergedLegalDocument } from '@thaiakha/shared/lib/mergeLegalTranslation';
import LegalDocumentBody from './LegalDocumentBody';
import LegalTranslationNotices from './LegalTranslationNotices';
import { Caption, Heading } from '../typography';
import { useTranslation } from 'react-i18next';
import { formatDateByLanguage } from '../../lib/dateFormatter';

interface LegalModalProps {
  document: MergedLegalDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ document, isOpen, onClose }) => {
  const { i18n } = useTranslation();

  const formatDate = (dateStr: string) => {
    return formatDateByLanguage(dateStr, i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!document) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full mx-4 sm:mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">
      <div className="flex flex-col h-[85vh] sm:h-[80vh]">
        {/* Header */}
        <div className="flex-none px-6 sm:px-8 py-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <Heading level="h3" className="sm:text-3xl tracking-tight text-body uppercase">
              {document.title}
            </Heading>
            <Caption className="sm:text-sm mt-2">
              Effective: {formatDate(document.effectiveDate)}
            </Caption>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6">
          <LegalTranslationNotices document={document} />
          <LegalDocumentBody document={document} />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
      `}</style>
    </Modal>
  );
};

export default LegalModal;
