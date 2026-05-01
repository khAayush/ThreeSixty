import { XMarkIcon } from "@heroicons/react/24/outline";

export const Modal = ({ title, onClose, wide = false, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div
      className={`bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${
        wide ? "max-w-2xl" : "max-w-md"
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

export const ModalActions = ({ onCancel, onConfirm, confirmLabel, loading }) => (
  <div className="flex justify-end gap-3 mt-6">
    <button
      onClick={onCancel}
      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
    >
      Cancel
    </button>
    <button
      onClick={onConfirm}
      disabled={loading}
      className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-brand/90 transition-colors"
    >
      {loading ? "Saving…" : confirmLabel}
    </button>
  </div>
);
