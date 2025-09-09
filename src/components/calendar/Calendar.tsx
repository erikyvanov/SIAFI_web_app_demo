import React from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import type { CalendarDay } from '../../types/InterviewTypes';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  availableDays: CalendarDay[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  availableDays,
  minDate,
  maxDate,
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());

  const days = [];
  const currentDate = new Date(startOfCalendar);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const isDateInRange = (date: Date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const hasAvailability = (date: Date) => {
    return availableDays.some(day => 
      day.date.toDateString() === date.toDateString() && day.hasAvailability
    );
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    if (isDateInRange(date) && hasAvailability(date)) {
      onDateSelect(date);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header of the calendar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Mes anterior"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-siafi-h4 text-siafi-on-surface">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Mes siguiente"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-siafi-caption text-gray-500 font-medium bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const inRange = isDateInRange(date);
          const available = hasAvailability(date);
          const selected = isSelected(date);
          const currentMonthDay = isCurrentMonth(date);
          const today = isToday(date);
          const clickable = inRange && available;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={!clickable}
              className={`
                relative p-3 text-center transition-all duration-200 min-h-[3rem]
                ${currentMonthDay ? 'text-gray-900' : 'text-gray-300'}
                ${clickable ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-not-allowed'}
                ${selected ? 'bg-siafi-primary text-white hover:bg-siafi-primary-hover' : ''}
                ${today && !selected ? 'bg-blue-100 font-semibold' : ''}
                ${!currentMonthDay ? 'opacity-50' : ''}
              `}
            >
              <span className="text-siafi-body">{date.getDate()}</span>
              
              {/* Availability indicator */}
              {available && currentMonthDay && (
                <div className={`
                  absolute bottom-1 left-1/2 transform -translate-x-1/2 
                  w-2 h-2 rounded-full
                  ${selected ? 'bg-white' : 'bg-siafi-primary'}
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-siafi-primary rounded-full"></div>
          <span className="text-siafi-caption text-gray-600">Horarios disponibles</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
          <span className="text-siafi-caption text-gray-600">Hoy</span>
        </div>
      </div>
    </div>
  );
};
