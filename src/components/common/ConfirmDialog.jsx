import React from 'react';
import { InlineSpinner } from './LoadingSpinner';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) => {
  // Close on escape key - must be before early return
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: '⚠️',
      buttonClass: 'btn-danger',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800'
    },
    warning: {
      icon: '⚠️',
      buttonClass: 'btn-warning',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    info: {
      icon: 'ℹ️',
      buttonClass: 'btn-primary',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    }
  };

  const style = typeStyles[type];

  const handleConfirm = async () => {
    if (loading) return;
    await onConfirm();
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{style.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          {/* Message */}
          <div className={`p-4 rounded-lg ${style.bgColor} ${style.borderColor} border`}>
            <p className={`text-sm ${style.textColor}`}>{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className={`btn btn-secondary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`btn ${style.buttonClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center gap-2`}
          >
            {loading && <InlineSpinner />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Specialized delete confirmation dialog
export const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, itemName, itemType = 'item', loading = false }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title={`Delete ${itemType}`}
    message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
    confirmText="Delete"
    cancelText="Cancel"
    type="danger"
    loading={loading}
  />
);

export default ConfirmDialog;