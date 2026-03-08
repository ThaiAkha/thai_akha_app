import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Icon, Typography } from './index';

interface MiniCalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, className }) => {
  const [viewDate, setViewDate] = useState(new Date(value));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
  };

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const today = new Date();

    // Padding for empty slots at start
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const isSelected = value.getDate() === d && value.getMonth() === month && value.getFullYear() === year;
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

      days.push(
        <button
          key={d}
          onClick={() => handleDateSelect(d)}
          className={cn(
            "h-10 w-full rounded-xl flex items-center justify-center text-xs font-black transition-all active:scale-90",
            isSelected 
              ? "bg-action text-white shadow-action-glow" 
              : isToday
                ? "bg-action/10 text-action border border-action/20"
                : "text-title hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          {d}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={cn("p-4 bg-surface dark:bg-[#1a1a1a] rounded-[2rem] border border-border shadow-xl", className)}>
      <div className="flex items-center justify-between mb-4 px-2">
        <Typography variant="h6" className="text-[10px] font-black uppercase tracking-widest text-desc/60">
          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Typography>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
            <Icon name="chevron_left" size="xs" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
            <Icon name="chevron_right" size="xs" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-[8px] font-black text-desc/30 uppercase">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
};

export default MiniCalendar;