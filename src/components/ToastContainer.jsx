import React from 'react';
import ToastNotification from './ToastNotification';

const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;






