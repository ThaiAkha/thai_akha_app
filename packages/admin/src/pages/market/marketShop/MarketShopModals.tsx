/**
 * Market Shop - modali: scelta data (nuovo report teacher, manager) e tastierino prezzo.
 * Estratto da MarketShop.tsx (#16), DOM invariato.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/modal';
import Button from '../../../components/ui/button/Button';
import MiniCalendar from '../../../components/common/MiniCalendar';
import NumericKeypad from '../../../components/common/NumericKeypad';
import { Heading } from '../../../components/typography';
import type { MarketShopState } from './useMarketShop';

export const MarketShopModals: React.FC<{ s: MarketShopState }> = ({ s }) => {
  const { t } = useTranslation('market');
  const {
    isCalendarModalOpen, setIsCalendarModalOpen, selectedDate, startNewReport,
    keypadOpen, setKeypadOpen, tempPrice, handleKeypadPress, handleKeypadDelete, handleKeypadConfirm,
  } = s;
  return (
    <>
    {/* Date Selection Modal */}
    <Modal
      isOpen={isCalendarModalOpen}
      onClose={() => setIsCalendarModalOpen(false)}
      className="max-w-sm p-6"
    >
      <div className="mb-6 text-center">
        <Heading level="h4" className="leading-7">{t('modal.selectDate')}</Heading>
      </div>
      <div className="flex flex-col gap-6">
        <MiniCalendar
          value={selectedDate}
          onChange={(d: Date) => startNewReport(d)}
          className="w-full"
        />
        <Button className="w-full" variant="outline" onClick={() => setIsCalendarModalOpen(false)}>{t('buttons.cancel')}</Button>
      </div>
    </Modal>

    {/* Numerical Keypad Modal */}
    <Modal isOpen={keypadOpen} onClose={() => setKeypadOpen(false)} className="bg-transparent border-none shadow-none max-w-sm p-0">
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 border-primary-500 text-center shadow-2xl">
          <span className="uppercase font-black text-primary-600 tracking-widest mb-1 block text-xs">{t('labels.inputThb')}</span>
          <div className="font-mono text-title text-4xl font-bold flex items-center justify-center gap-2">
            {tempPrice}<span className="text-xl opacity-50">฿</span>
          </div>
        </div>
        <NumericKeypad
          onKeyPress={handleKeypadPress}
          onDelete={handleKeypadDelete}
          onConfirm={handleKeypadConfirm}
        />
      </div>
    </Modal>
    </>
  );
};
