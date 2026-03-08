import React, { useState, useMemo } from 'react';
import { getDateKey } from '../../utils/dateKeyUtils';
import CalendarMaster, { CalendarDay, LegendItem } from '../common/CalendarMaster';
import { useCalendarAvailability } from '../../hooks/useCalendarAvailability';

interface BookingCalendarViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({
  currentDate,
  onSelectDate,
  onClose,
}) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const { availability, loading } = useCalendarAvailability(viewDate);

  // Build calendar days
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = firstDayOfMonth.getDay();

    const currentLoop = new Date(year, month, 1 - startDayIndex);
    const days: CalendarDay[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentLoop);
      const dateStr = getDateKey(date);
      const data = availability[dateStr];

      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      const isPast = checkDate.getTime() < today.getTime();
      const isCurrentMonth = date.getMonth() === viewDate.getMonth();
      const isSelected = getDateKey(date) === getDateKey(currentDate);

      // Map DayData to CalendarMaster's expected shape
      const mappedData = data ? {
        morning: data.morning_class,
        evening: data.evening_class,
      } : undefined;

      days.push({
        date,
        dateStr,
        isPast,
        isCurrentMonth,
        isSelected,
        loading,
        data: mappedData,
      });

      currentLoop.setDate(currentLoop.getDate() + 1);
    }

    return days;
  }, [viewDate, availability, loading, currentDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentMonth =
    viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

  const handlePrev = () => {
    if (isCurrentMonth) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNext = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleDateClick = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const legend: LegendItem[] = [
    { label: 'Available', color: 'bg-green-500' },
    { label: 'Fully Booked', color: 'bg-red-500' },
    { label: 'Closed', color: 'bg-orange-400' },
    { label: 'Selected', color: 'bg-brand-500', borderColor: 'border-brand-400' },
  ];

  return (
    <CalendarMaster
      viewDate={viewDate}
      subtitle="Select a date for booking"
      onPrev={handlePrev}
      onNext={handleNext}
      canNavigatePrev={!isCurrentMonth}
      onClose={onClose}
      calendarDays={calendarDays}
      onDateClick={handleDateClick}
      loading={loading}
      legend={legend}
      badgeSize="sm"
      showBadgeIcons={false}
    />
  );
};

export default BookingCalendarView;
