import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle2, Package, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import InputField from '../../../components/form/input/InputField';
import SelectField from '../../../components/form/input/SelectField';
import TextArea from '../../../components/form/input/TextArea';
import ZoneInfoCard, { type ZoneInfo } from '../ZoneInfoCard';
import { Heading, SectionTitle } from '../../typography';

/** Minimal structural shapes used by this form (parent hooks pass full DB rows). */
export interface LogisticsHotel {
  id: string;
  name: string;
  pickup_zones?: { name: string } | null;
}
export type LogisticsZone = Pick<ZoneInfo, 'id' | 'name'> & Partial<Omit<ZoneInfo, 'id' | 'name'>>;
export interface LogisticsMeetingPoint {
  id: string;
  name: string;
}

interface BookingLogisticsFormProps {
  hotelSearchQuery: string;
  onHotelSearchQueryChange: (q: string) => void;
  hotelSearchResults: LogisticsHotel[];
  /** Method syntax (bivariant): callers pass handlers typed on their fuller hotel row. */
  onHotelSelect(h: LogisticsHotel): void;
  pickupZone: LogisticsZone | null;
  notes: string;
  onNotesChange: (n: string) => void;
  hasLuggage: boolean;
  onHasLuggageChange: (l: boolean) => void;
  meetingPoints: LogisticsMeetingPoint[];
  meetingPoint: string;
  onMeetingPointChange: (m: string) => void;
  /** Method syntax (bivariant): callers type the setter as (h: Hotel) => void, the form clears it with null. */
  onSetHotel(h: LogisticsHotel | null): void;
  session: 'morning_class' | 'evening_class';
}

const BookingLogisticsForm: React.FC<BookingLogisticsFormProps> = ({
  hotelSearchQuery,
  onHotelSearchQueryChange,
  hotelSearchResults,
  onHotelSelect,
  pickupZone,
  notes,
  onNotesChange,
  hasLuggage,
  onHasLuggageChange,
  meetingPoints,
  meetingPoint,
  onMeetingPointChange,
  onSetHotel,
  session,
}) => {
  const { t } = useTranslation('booking');
  const [needPickup, setNeedPickup] = useState<boolean | null>(null);

  return (
    <div className="mt-12 pt-12 border-t border-gray-100 dark:border-gray-800 space-y-8">
      <Heading level="h3" className="italic tracking-tighter flex items-center gap-3 text-title uppercase">
        <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
          <Truck size={20} />
        </div>
        {t('logistics.sectionTitle')}
      </Heading>

      {/* Logistics Layout - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">

        {/* Need Pickup Toggle */}
        <div className="col-span-12 md:col-span-3">
          <SectionTitle as="h6" tone="sub" className="mb-2">{t('logistics.needPickup')}</SectionTitle>
          <div className="grid grid-cols-2 gap-3 h-14">
            <button
              type="button"
              onClick={() => setNeedPickup(true)}
              className={cn(
                "h-full rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                needPickup === true
                  ? "border-primary-500/50 bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-lg shadow-primary-500/10 scale-[1.02]"
                  : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-sub hover:border-gray-200"
              )}
            >
              <CheckCircle2 size={14} />
              {t('logistics.yes')}
            </button>
            <button
              type="button"
              onClick={() => setNeedPickup(false)}
              className={cn(
                "h-full rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                needPickup === false
                  ? "border-red-500/50 bg-red-500/10 text-error shadow-lg shadow-red-500/10 scale-[1.02]"
                  : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-sub hover:border-gray-200"
              )}
            >
              {t('logistics.no')}
            </button>
          </div>
        </div>

        {/* Hotel / Meeting Point */}
        {needPickup !== null && (
          <>
            <div className="col-span-12 md:col-span-6 lg:col-span-6 relative">
              {needPickup ? (
                // Hotel Search
                <div className="relative">
                  <InputField
                    label={t('logistics.fieldHotel')}
                    placeholder={t('logistics.hotelPlaceholder')}
                    value={hotelSearchQuery}
                    onChange={e => onHotelSearchQueryChange(e.target.value)}
                    autoComplete="off"
                  />
                  {hotelSearchResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                      {hotelSearchResults.map(h => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            onHotelSelect(h);
                            onMeetingPointChange('');
                          }}
                          className="w-full p-4 text-left hover:bg-primary-50 dark:hover:bg-primary-500/10 border-b border-gray-50 dark:border-gray-800 last:border-0 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                              <MapPin className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                            </div>
                            <div>
                              <SectionTitle className="tracking-tight text-title">{h.name}</SectionTitle>
                              <SectionTitle tone="sub" className="tracking-widest">{h.pickup_zones?.name || 'No Zone'}</SectionTitle>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Meeting Point Dropdown
                <SelectField
                  label={t('logistics.meetingPoint')}
                  value={meetingPoint}
                  onChange={e => {
                    onMeetingPointChange(e.target.value);
                    if (e.target.value) {
                      onSetHotel(null);
                    }
                  }}
                >
                  <option value="">{t('logistics.selectMeetingPoint')}</option>
                  {meetingPoints.map(point => (
                    <option key={point.id} value={point.name}>
                      {point.name}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>

            <div className="col-span-12 md:col-span-3">
              <SectionTitle as="h6" tone="sub" className="mb-2">{t('logistics.luggage')}</SectionTitle>
              <div className="grid grid-cols-2 gap-3 h-14">
                <button
                  type="button"
                  onClick={() => onHasLuggageChange(true)}
                  className={cn(
                    "h-full rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                    hasLuggage === true
                      ? "border-primary-500/50 bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-lg shadow-primary-500/10 scale-[1.02]"
                      : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-sub hover:border-gray-200"
                  )}
                >
                  <Package size={14} />
                  {t('logistics.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => onHasLuggageChange(false)}
                  className={cn(
                    "h-full rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                    hasLuggage === false
                      ? "border-emerald-500/50 bg-emerald-500/10 text-success shadow-lg shadow-emerald-500/10 scale-[1.02]"
                      : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-sub hover:border-gray-200"
                  )}
                >
                  <HelpCircle size={14} />
                  {t('logistics.no')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {pickupZone && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500">
          <ZoneInfoCard zone={{ ...pickupZone, color_code: pickupZone.color_code ?? null }} session={session} />
        </div>
      )}

      <TextArea
        label={t('logistics.extraNotes')}
        placeholder={t('logistics.notesPlaceholder')}
        value={notes}
        onChange={onNotesChange}
        rows={4}
      />
    </div>
  );
};

export default BookingLogisticsForm;
