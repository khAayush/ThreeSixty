import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Usage:
 *   setConfirm({ title, message, confirmLabel, danger, onConfirm, requireNote, notePlaceholder })
 *
 *   When requireNote is true, the confirm button stays disabled until a note is typed.
 *   onConfirm receives the note string as its first argument (empty string if no note).
 */
const ConfirmModal = ({
  title,
  message,
  onConfirm,
  onClose,
  confirmLabel = "Confirm",
  danger = false,
  requireNote = false,
  notePlaceholder = "Add a reason…",
}) => {
  const [note, setNote] = useState("");

  if (!title) return null;

  const canConfirm = !requireNote || note.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onClose();
    onConfirm?.(note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${danger ? "bg-red-100" : "bg-amber-100"}`}>
              <ExclamationTriangleIcon className={`w-5 h-5 ${danger ? "text-red-600" : "text-amber-600"}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              {message && <p className="mt-1 text-sm text-slate-500 leading-relaxed">{message}</p>}
            </div>
          </div>

          {requireNote && (
            <div>
              <textarea
                rows={2}
                placeholder={notePlaceholder}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">This field is required</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-brand hover:bg-brand/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
