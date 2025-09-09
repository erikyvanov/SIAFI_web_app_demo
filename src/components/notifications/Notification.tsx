import React from 'react';
import type { NotificationProps } from './types';

const notificationStyles = {
  success: {
    borderColor: 'border-siafi-success',
    backgroundColor: 'bg-siafi-success/20',
    textColor: 'text-siafi-success',
    barColor: 'bg-siafi-success',
  },
  warning: {
    borderColor: 'border-siafi-warning',
    backgroundColor: 'bg-siafi-warning/20', 
    textColor: 'text-siafi-warning',
    barColor: 'bg-siafi-warning',
  },
  error: {
    borderColor: 'border-siafi-error',
    backgroundColor: 'bg-siafi-error/20',
    textColor: 'text-siafi-error', 
    barColor: 'bg-siafi-error',
  },
  info: {
    borderColor: 'border-siafi-information',
    backgroundColor: 'bg-siafi-information/20',
    textColor: 'text-siafi-information',
    barColor: 'bg-siafi-information',
  },
};

export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  className = '',
}) => {
  const styles = notificationStyles[type];

  return (
    <div 
      className={`
        flex items-center justify-center overflow-hidden rounded-lg w-full
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center self-stretch">
        <div 
          className={`
            h-full w-[5px] shrink-0
            ${styles.barColor}
          `}
        />
      </div>
      
      <div 
        className={`
          flex-1 flex items-center gap-2.5 p-4 min-h-0
          ${styles.backgroundColor}
        `}
      >
        <div 
          className={`
            text-siafi-body font-siafi-inter
            ${styles.textColor}
          `}
        >
          <span className="font-bold">
            {title}
          </span>
          <br />
          <span className="font-medium">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Notification;