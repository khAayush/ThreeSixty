import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Modal for approving an asset request.
 * Props:
 *   assignment  – the full assignment object (populated)
 *   authHeaders – { Authorization, Content-Type }
 *   onClose     – close without action
 *   onApproved  – called after a successful approval
 */
const ApproveModal = ({ assignment, authHeaders, onClose, onApproved }) => {
  const a = assignment;
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/assignments/available/${a.unitId?._id || a.unitId}`, {
          credentials: "include",
          headers: authHeaders,
        });
        const data = await res.json();
        if (data.success) {
          setAssets(data.data);
          const suggestion = data.data.find((x) => x._id === (a.assetId?._id || a.assetId));
          setSelectedAssetId(suggestion ? suggestion._id : (data.data[0]?._id || ""));
        }
      } catch {
        toast.error("Failed to load available assets");
      } finally {
        setLoadingAssets(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async () => {
    if (!selectedAssetId) return toast.error("Please select an asset");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/assignments/${a._id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders,
        body: JSON.stringify({ assetId: selectedAssetId, adminNote: adminNote.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request approved!");
        onApproved();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to approve request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Approve Request</p>
            <h3 className="text-lg font-bold text-slate-800">{a.unitId?.name || "-"}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Employee info */}
          <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-500">
            Requested by{" "}
            <span className="font-semibold text-slate-700">{a.requestedBy?.name}</span>
          </div>

          {/* Asset picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Assign Asset
            </label>
            {loadingAssets ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : assets.length === 0 ? (
              <p className="text-sm text-red-500 font-medium">No available assets - cannot approve</p>
            ) : (
              <div className="relative">
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full appearance-none pl-3 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 outline-none"
                >
                  {assets.map((x) => (
                    <option key={x._id} value={x._id}>{x.tag}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Admin note (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Note <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Add a note for the employee…"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting || assets.length === 0}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-60"
          >
            {submitting ? "Approving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
