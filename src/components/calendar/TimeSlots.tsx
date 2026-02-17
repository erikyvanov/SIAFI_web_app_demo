import React from 'react';
import { Button } from '../ui';
import type { ScheduleBlock } from '../../types/InterviewTypes';

interface TimeSlotsProps {
  selectedDate: Date;
  schedules: ScheduleBlock[];
  selectedScheduleId: number | null;
  onScheduleSelect: (scheduleId: number) => void;
  onConfirm: () => void;
  isConfirming?: boolean;
  className?: string;
}

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

const formatDateLong = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  };
  return date.toLocaleDateString('es-MX', options);
};

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  selectedDate,
  schedules,
  selectedScheduleId,
  onScheduleSelect,
  onConfirm,
  isConfirming = false,
  className = '',
}) => {
  if (schedules.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center ${className}`}>
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-siafi-body text-gray-600">
            No hay horarios disponibles para esta fecha.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-[26rem] ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-siafi-h4 text-siafi-on-surface mb-1">
          Horarios disponibles
        </h3>
        <p className="text-siafi-body text-gray-600 capitalize">
          {formatDateLong(selectedDate)}
        </p>
        <p className="text-siafi-caption text-gray-500 flex items-center mt-1">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Hora CDMX
        </p>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
        {schedules.map((schedule) => (
          <button
            key={schedule.id}
            onClick={() => onScheduleSelect(schedule.id)}
            className={`
              w-full p-4 rounded-lg border-2 text-left transition-all duration-200 cursor-pointer
              ${selectedScheduleId === schedule.id
                ? 'border-siafi-primary bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-siafi-body-medium text-siafi-on-surface">
                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </div>
                <div className="text-siafi-caption text-gray-500 mt-1">
                  Duración: 20 minutos
                </div>
              </div>
              
              {selectedScheduleId === schedule.id && (
                <div className="text-siafi-primary">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Button
          variant="primary"
          fullWidth
          onClick={onConfirm}
          loading={isConfirming}
          disabled={isConfirming || !selectedScheduleId}
          className="text-lg font-semibold"
        >
          {isConfirming ? 'Agendando...' : 'Confirmar entrevista'}
        </Button>
      </div>
    </div>
  );
};
