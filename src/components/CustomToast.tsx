import React from 'react';
import { Toast } from 'react-bootstrap';
import { format } from 'date-fns';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  show: boolean;
  onClose: () => void;
}

const toastConfig = {
  success: { 
    header: { bg: 'success', textColor: 'white' },
    body: { bg: 'success-light', textColor: 'dark' }
  },
  error: { 
    header: { bg: 'danger', textColor: 'white' },
    body: { bg: 'danger-light', textColor: 'dark' }
  },
  warning: { 
    header: { bg: 'warning', textColor: 'dark' },
    body: { bg: 'warning-light', textColor: 'dark' }
  },
  info: { 
    header: { bg: 'info', textColor: 'dark' },
    body: { bg: 'info-light', textColor: 'dark' }
  },
};

export const CustomToast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  timestamp,
  show,
  onClose,
}) => {
  return (
    <Toast
      show={show}
      onClose={onClose}
      className={`position-fixed bottom-0 end-0 m-3 fade ${show ? 'show' : ''}`}
      delay={3000}
      autohide
    >
      <Toast.Header className={`bg-${toastConfig[type].header.bg} text-${toastConfig[type].header.textColor}`}>
        <strong className="me-auto">{title}</strong>
        <small>{format(new Date(timestamp), 'HH:mm:ss')}</small>
      </Toast.Header>
      <Toast.Body className={`bg-${toastConfig[type].body.bg} text-${toastConfig[type].body.textColor}`}>
        {message}
      </Toast.Body>
    </Toast>
  );
};