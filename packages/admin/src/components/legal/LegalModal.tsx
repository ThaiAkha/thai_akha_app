import React from 'react';
import { Modal } from '../ui/modal';
import type { LegalDocument } from '@thaiakha/shared/types';

interface LegalModalProps {
  document: LegalDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ document, isOpen, onClose }) => {
  if (!document) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderContent = (content: string | string[] | undefined) => {
    if (!content) return null;
    if (typeof content === 'string') {
      return <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{content}</p>;
    }
    return (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300">
        {content.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  };

  const renderSection = (section: any, depth = 0) => {
    const isSubsection = depth > 0;
    return (
      <div key={section.title} className={isSubsection ? 'ml-4 mb-6' : 'mb-8'}>
        {isSubsection ? (
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
            {section.title}
          </h3>
        ) : (
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 pt-4">
            {section.title}
          </h2>
        )}
        {renderContent(section.content)}
        {section.subsections &&
          section.subsections.map((subsection: any) => (
            <div key={subsection.title} className="ml-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
                {subsection.title}
              </h3>
              {renderContent(subsection.content)}
            </div>
          ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl w-full mx-4 sm:mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl">
      <div className="flex flex-col h-[85vh] sm:h-[80vh]">
        {/* Header */}
        <div className="flex-none px-6 sm:px-8 py-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-white/90 uppercase tracking-tight">
              {document.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
              Effective: {formatDate(document.effectiveDate)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-6">
          <div className="max-w-none prose prose-sm dark:prose-invert">
            {document.sections.map((section) => renderSection(section))}
          </div>
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
