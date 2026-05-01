import { XMarkIcon } from "@heroicons/react/24/outline";
import { STATUS_COLORS, fmtDate } from "./inventoryUtils";

const AssetDetailModal = ({ asset, logs, onClose }) => {
  if (!asset) return null;
  const catType = asset.categoryId?.type;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <p className="font-mono text-xl font-bold text-slate-800">{asset.tag}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {asset.unitId?.name} · {asset.categoryId?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors mt-1"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[asset.status]}`}>
                {asset.status}
              </span>
            </div>

            {catType === "fixed" && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {asset.location || "In-Store"}
                </p>
              </div>
            )}

            {catType === "assignable" && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Assigned
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {asset.isAssigned ? "Yes" : "No"}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Created
              </p>
              <p className="text-sm text-slate-700">{fmtDate(asset.createdAt)}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Created By
              </p>
              <p className="text-sm text-slate-700">{asset.createdBy?.name || "—"}</p>
            </div>
          </div>

          {/* History */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">
              History ({logs?.length || 0})
            </h4>
            {!logs?.length ? (
              <p className="text-sm text-slate-400">No history available</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl text-sm">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          log.actionType === "CREATED"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.actionType === "STATUS_CHANGE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {log.actionType.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-400 text-xs">{fmtDate(log.changedAt)}</span>
                      <span className="text-slate-400 text-xs ml-auto">
                        by {log.changedBy?.name || "System"}
                      </span>
                    </div>
                    {log.actionType === "STATUS_CHANGE" && (
                      <p className="text-slate-600 text-xs">
                        {log.fromStatus} → {log.toStatus}
                      </p>
                    )}
                    {log.actionType === "LOCATION_CHANGE" && (
                      <p className="text-slate-600 text-xs">
                        {log.fromLocation || "In-Store"} → {log.toLocation || "In-Store"}
                      </p>
                    )}
                    {log.comment && (
                      <p className="text-slate-500 text-xs mt-1">{log.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailModal;
