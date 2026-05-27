import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { CubeIcon, ClockIcon, CheckCircleIcon, ArchiveBoxIcon, XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { showLoading, showSuccess, showError } from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

const STATUS_STYLES = {
  Pending:   "bg-amber-50 text-amber-600",
  Approved:  "bg-blue-50 text-blue-600",
  Rejected:  "bg-red-50 text-red-500",
  Returned:  "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-slate-100 text-slate-500",
};

const TABS = [
  { key: "pending",  label: "Pending Requests", icon: ClockIcon },
  { key: "assigned", label: "Assigned to Me",   icon: CheckCircleIcon },
  { key: "history",  label: "History",           icon: ArchiveBoxIcon },
];

const EmployeeInventoryPage = ({ onLogout }) => {
  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [assignments, setAssignments] = useState([]);
  const [lostReportMap, setLostReportMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const [reportLostModal, setReportLostModal] = useState(null);
  const [lostLocation, setLostLocation] = useState("");
  const [submittingLost, setSubmittingLost] = useState(false);

  const loadData = async () => {
    try {
      const [assignRes, lostRes] = await Promise.all([
        fetch(`${API_URL}/assignments/my`, { credentials: "include", headers: authHeaders }),
        fetch(`${API_URL}/lostandfound?myReports=true&status=open&type=lost`, { credentials: "include", headers: authHeaders }),
      ]);
      if (assignRes.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }
      const [assignData, lostData] = await Promise.all([assignRes.json(), lostRes.json()]);
      if (assignData.success) setAssignments(assignData.data);
      else toast.error(assignData.message);
      if (lostData.success) {
        const map = {};
        lostData.data.forEach((r) => { if (r.assetCode) map[r.assetCode] = r.id; });
        setLostReportMap(map);
      }
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabData = useMemo(() => ({
    pending:  assignments.filter((a) => a.status === "Pending"),
    assigned: assignments.filter((a) => a.status === "Approved"),
    history:  assignments.filter((a) => a.status === "Returned" || a.status === "Rejected" || a.status === "Cancelled"),
  }), [assignments]);

  const openReportLost = (assignment) => {
    setLostLocation("");
    setReportLostModal({ assignment });
  };

  const submitReportLost = async () => {
    if (!lostLocation.trim()) return;
    const a = reportLostModal.assignment;
    setSubmittingLost(true);
    const toastId = showLoading("Submitting lost report…");
    try {
      const res = await fetch(`${API_URL}/lostandfound`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders,
        body: JSON.stringify({
          assetCode: a.assetId?.tag || "NO-TAG",
          assetName: a.unitId?.name || "Unknown Asset",
          location: lostLocation.trim(),
          type: "lost",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Lost asset reported successfully", toastId);
        setReportLostModal(null);
        await loadData();
      } else {
        showError(data.message || "Failed to submit report", toastId);
      }
    } catch {
      showError("Failed to submit report", toastId);
    } finally {
      setSubmittingLost(false);
    }
  };

  const handleCancelRequest = async (assignmentId) => {
    const toastId = showLoading("Cancelling request…");
    try {
      const res = await fetch(`${API_URL}/assignments/${assignmentId}/cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Request cancelled", toastId);
        await loadData();
      } else {
        showError(data.message || "Failed to cancel", toastId);
      }
    } catch {
      showError("Failed to cancel request", toastId);
    }
  };

  const handleCancelLostReport = async (assetTag) => {
    const reportId = lostReportMap[assetTag];
    if (!reportId) return;
    const toastId = showLoading("Cancelling report…");
    try {
      const res = await fetch(`${API_URL}/lostandfound/${reportId}/cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Reported Found", toastId);
        await loadData();
      } else {
        showError(data.message || "Failed to report found", toastId);
      }
    } catch {
      showError("Failed to report found", toastId);
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-6 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Assets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your requests, assigned assets, and history</p>
        </div>

        <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-xl w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {tabData[key].length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === key ? "bg-brand/10 text-brand" : "bg-slate-200 text-slate-500"
                }`}>
                  {tabData[key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        ) : (
          <TabContent tab={activeTab} rows={tabData[activeTab]} onReportLost={openReportLost} lostReportMap={lostReportMap} onCancelLostReport={handleCancelLostReport} onCancelRequest={handleCancelRequest} />
        )}
      </div>

      {reportLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report Lost</p>
                  <h3 className="text-base font-bold text-slate-800">{reportLostModal.assignment.unitId?.name}</h3>
                </div>
              </div>
              <button onClick={() => setReportLostModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Asset Tag</label>
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-600">
                    {reportLostModal.assignment.assetId?.tag || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Item</label>
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 truncate">
                    {reportLostModal.assignment.unitId?.name || "-"}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Last Known Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lostLocation}
                  onChange={(e) => setLostLocation(e.target.value)}
                  placeholder="e.g., Conference Room B, Floor 3"
                  autoFocus
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 pb-5">
              <button
                onClick={() => setReportLostModal(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReportLost}
                disabled={submittingLost || !lostLocation.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {submittingLost ? "Submitting…" : "Report Lost"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const Empty = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
    <CubeIcon className="w-10 h-10 mb-3 opacity-40" />
    <p className="font-semibold text-sm">{message}</p>
  </div>
);

const TabContent = ({ tab, rows, onReportLost, lostReportMap, onCancelLostReport, onCancelRequest }) => {
  if (rows.length === 0) {
    const messages = {
      pending:  "No pending requests",
      assigned: "No assets assigned to you",
      history:  "No history yet",
    };
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Empty message={messages[tab]} />
      </div>
    );
  }

  if (tab === "pending") return <PendingTable rows={rows} onCancelRequest={onCancelRequest} />;
  if (tab === "assigned") return <AssignedTable rows={rows} onReportLost={onReportLost} lostReportMap={lostReportMap} onCancelLostReport={onCancelLostReport} />;
  return <HistoryTable rows={rows} />;
};

const PendingTable = ({ rows, onCancelRequest }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-125">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-3">Item</th>
            <th className="px-6 py-3">Reason</th>
            <th className="px-6 py-3">Requested On</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((a) => (
            <tr key={a._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-800">{a.unitId?.name || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500 max-w-60 truncate">{a.note || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{fmtDate(a.createdAt)}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onCancelRequest(a._id)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AssignedTable = ({ rows, onReportLost, lostReportMap, onCancelLostReport }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-160">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-3">Asset Tag</th>
            <th className="px-6 py-3">Item</th>
            <th className="px-6 py-3">Assigned By</th>
            <th className="px-6 py-3">Assigned On</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((a) => {
            const tag = a.assetId?.tag;
            const isLost = a.assetId?.isLost && lostReportMap[tag];
            return (
              <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-800">{tag || "-"}</td>
                <td className="px-6 py-4 font-semibold text-slate-700">{a.unitId?.name || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{a.assignedBy?.name || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{fmtDate(a.assignedAt)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isLost ? (
                    <button
                      onClick={() => onCancelLostReport(tag)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-emerald-100 border border-slate-200 rounded-lg hover:bg-emerald-200 transition-colors whitespace-nowrap"
                    >
                      Report Found
                    </button>
                  ) : (
                    <button
                      onClick={() => onReportLost(a)}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                    >
                      Report Lost
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const HistoryTable = ({ rows }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-140">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-3">Item</th>
            <th className="px-6 py-3">Asset Tag</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Note</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((a) => (
            <tr key={a._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-slate-700">{a.unitId?.name || "-"}</td>
              <td className="px-6 py-4 font-mono text-sm text-slate-500">{a.assetId?.tag || "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {a.status === "Returned" ? fmtDate(a.returnedAt) : fmtDate(a.createdAt)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-400 max-w-48 truncate">
                {a.adminNote || a.note || "-"}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default EmployeeInventoryPage;
