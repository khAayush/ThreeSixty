import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mx-4">
        <h3 className="text-sm font-semibold text-gray-900">{title || 'Confirm'}</h3>
        <p className="text-xs text-gray-500 mt-2">{message || 'Are you sure?'}</p>

        <div className="mt-5 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
