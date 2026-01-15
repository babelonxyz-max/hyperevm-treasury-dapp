import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastNotification = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show notification after mount
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="toast-icon" />;
      case 'error':
        return <XCircle size={20} className="toast-icon" />;
      case 'warning':
        return <AlertCircle size={20} className="toast-icon" />;
      default:
        return <Info size={20} className="toast-icon" />;
    }
  };

  return (
    <div 
      className={`toast-notification ${type} ${isVisible ? 'visible' : ''} ${isLeaving ? 'leaving' : ''}`}
      onClick={handleClose}
    >
      <div className="toast-content">
        <div className="toast-icon-container">
          {getIcon()}
        </div>
        <div className="toast-text">
          {title && <div className="toast-title">{title}</div>}
          <div className="toast-message">{message}</div>
        </div>
        <button 
          className="toast-close"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <X size={16} />
        </button>
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar"
          style={{
            animation: `toast-progress ${duration}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

export default ToastNotification;






