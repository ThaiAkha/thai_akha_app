import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle2, Package, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import InputField from '../../../components/form/input/InputField';
import SelectField from '../../../components/form/input/SelectField';
import TextArea from '../../../components/form/input/TextArea';
import ZoneInfoCard from '../ZoneInfoCard';
import SectionHeader from '../../ui/SectionHeader';

interface BookingLogisticsFormProps {
  hotelSearchQuery: string;
  onHotelSearchQueryChange: (q: string) => void;
  hotelSearchResults: any[];
  onHotelSelect: (h: any) => void;
  pickupZone: any | null;
  notes: string;
  onNotesChange: (n: string) => void;
  hasLuggage: boolean;
  onHasLuggageChange: (l: boolean) => void;
  meetingPoints: any[];
  meetingPoint: string;
  onMeetingPointChange: (m: string) => void;
  onSetHotel: (h: any) => void;
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
      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
          <Truck size={20} />
        </div>
        {t('logistics.sectionTitle')}
      </h3>

      {/* Logistics Layout - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">

        {/* Need Pickup Toggle */}
        <div className="col-span-12 md:col-span-3">
          <SectionHeader title={t('logistics.needPickup')} className="mb-2" />
          <div className="grid grid-cols-2 gap-3 h-14">
            <button
              type="button"
              onClick={() => setNeedPickup(true)}
              className={cn(
                "h-full rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                needPickup === true
                  ? "border-brand-500/50 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-lg shadow-brand-500/10 scale-[1.02]"
                  : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-gray-400 hover:border-gray-200"
              )}
            >
              <CheckCircle2 size={14} />
              Yes
            </button>
            <button
              type="button"
              onClick={() => setNeedPickup(false)}
              className={cn(
                "h-full rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                needPickup === false
                  ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/10 scale-[1.02]"
                  : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-gray-400 hover:border-gray-200"
              )}
            >
              No
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
                    label="Hotel"
                    placeholder="Search hotel (min. 2 chars)..."
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
                          className="w-full p-4 text-left hover:bg-brand-50 dark:hover:bg-brand-500/10 border-b border-gray-50 dark:border-gray-800 last:border-0 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-colors">
                              <MapPin className="w-5 h-5 text-gray-400 group-hover:text-brand-500" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{h.name}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{h.pickup_zones?.name || 'No Zone'}</p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Meeting Point Dropdown
                <SelectField
                  label="Meeting Point"
                  value={meetingPoint}
                  onChange={e => {
                    onMeetingPointChange(e.target.value);
                    if (e.target.value) {
                      onSetHotel(null);
                    }
                  }}
                >
                  <option value="">Select a meeting point...</option>
                  {meetingPoints.map(point => (
                    <option key={point.id} value={point.name}>
                      {point.name}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>

            <div className="col-span-12 md:col-span-3">
              <SectionHeader title="Luggage" className="mb-2" />
              <div className="grid grid-cols-2 gap-3 h-14">
                <button
                  type="button"
                  onClick={() => onHasLuggageChange(true)}
                  className={cn(
                    "h-full rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                    hasLuggage === true
                      ? "border-brand-500/50 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-lg shadow-brand-500/10 scale-[1.02]"
                      : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-gray-400 hover:border-gray-200"
                  )}
                >
                  <Package size={14} />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => onHasLuggageChange(false)}
                  className={cn(
                    "h-full rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                    hasLuggage === false
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                      : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/10 text-gray-400 hover:border-gray-200"
                  )}
                >
                  <HelpCircle size={14} />
                  No
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {pickupZone && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500">
          <ZoneInfoCard zone={pickupZone} session={session} />
        </div>
      )}

      <TextArea
        label="Extra Notes"
        placeholder="Any special requests, dietary restrictions or additional information..."
        value={notes}
        onChange={onNotesChange}
        rows={4}
      />
    </div>
  );
};

export default BookingLogisticsForm;
