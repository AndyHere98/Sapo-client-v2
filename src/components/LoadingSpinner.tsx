import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ centered }) => {
  const spinnerClasses = centered ? 'd-flex justify-content-center align-items-center h-100' : '';

  return (
    <div className={spinnerClasses}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};