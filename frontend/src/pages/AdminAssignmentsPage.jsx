import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { showLoading, showSuccess, showError } from "../utils/toast";
import ConfirmModal from "../components/ConfirmModal";
import ApproveModal from "../components/ApproveModal";
import ImportAssignmentsModal from "../components/ImportAssignmentsModal";
import { MagnifyingGlassIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

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

const AdminAssignmentsPage = ({ onLogout }) => {
  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");

  const [approveModal, setApproveModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [importModal, setImportModal] = useState(false);

  const authFetch = (path, opts = {}) =>
    fetch(`${API_URL}${path}`, { credentials: "include", headers: authHeaders, ...opts });

  const fetchAssignments = async () => {
    try {
      const res = await authFetch("/assignments");
      if (res.status === 401) { window.location.href = "/login"; return; }
      const data = await res.json();
      if (data.success) setAssignments(data.data);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.toLowerCase();
  const match = (a) =>
    !q ||
    a.requestedBy?.name?.toLowerCase().includes(q) ||
    a.assignedTo?.name?.toLowerCase().includes(q) ||
    a.unitId?.name?.toLowerCase().includes(q) ||
    a.assetId?.tag?.toLowerCase().includes(q);

  const { pending, active, history } = useMemo(() => ({
    pending: assignments.filter((a) => a.status === "Pending").filter(match),
    active:  assignments.filter((a) => a.status === "Approved").filter(match),
    history: assignments.filter((a) => ["Returned","Rejected","Cancelled"].includes(a.status)).filter(match),
  }), [assignments, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReject = (a) => {
    setConfirm({
      title: "Deny Request",
      message: `Deny ${a.requestedBy?.name}'s request for "${a.unitId?.name}"?`,
      confirmLabel: "Deny",
      danger: true,
      requireNote: true,
      notePlaceholder: "Reason for denial…",
      onConfirm: async (adminNote) => {
        const res = await authFetch(`/assignments/${a._id}/reject`, {
          method: "PATCH",
          body: JSON.stringify({ adminNote }),
        });
        const data = await res.json();
        if (data.success) { toast.success("Request denied"); fetchAssignments(); }
        else toast.error(data.message);
      },
    });
  };

  const handleReturn = (a) => {
    setConfirm({
      title: "Process Return",
      message: `Mark asset ${a.assetId?.tag} as returned by ${a.assignedTo?.name}?`,
      confirmLabel: "Confirm Return",
      danger: false,
      onConfirm: async () => {
        const res = await authFetch(`/assignments/${a._id}/return`, { method: "PATCH" });
        const data = await res.json();
        if (data.success) { toast.success("Return processed"); fetchAssignments(); }
        else toast.error(data.message);
      },
    });
  };

  const handleAskToReturn = (a) => {
    setConfirm({
      title: "Ask to Return",
      message: `Send a return request email to ${a.assignedTo?.name} for asset ${a.assetId?.tag}?`,
      confirmLabel: "Send Email",
      danger: false,
      onConfirm: async () => {
        const toastId = showLoading("Sending return request email…");
        try {
          const res = await authFetch(`/assignments/${a._id}/request-return`, { method: "POST" });
          const data = await res.json();
          if (data.success) showSuccess("Return request email sent successfully", toastId);
          else showError(data.message || "Failed to send email", toastId);
        } catch {
          showError("Failed to send return request email", toastId);
        }
      },
    });
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Assignments & Requests</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage asset requests and track assignments</p>
          </div>
          <button
            onClick={() => setImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4 stroke-2" />
            Import CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-1 p-1.5 bg-slate-50 border border-slate-100 rounded-xl w-fit overflow-x-auto shrink-0">
              <TabBtn label="Requests" count={pending.length} countStyle="bg-amber-100 text-amber-700"
                active={activeTab === "requests"} onClick={() => setActiveTab("requests")} />
              <TabBtn label="Assignments" count={active.length} countStyle="bg-blue-100 text-blue-700"
                active={activeTab === "assignments"} onClick={() => setActiveTab("assignments")} />
              <TabBtn label="History" count={history.length} countStyle="bg-slate-200 text-slate-600"
                active={activeTab === "history"} onClick={() => setActiveTab("history")} />
            </div>
            <div className="relative w-full sm:w-64 sm:ml-auto">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, item, tag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === "requests" && (
                <RequestsTable rows={pending} onApprove={(a) => setApproveModal({ assignment: a })} onReject={handleReject} />
              )}
              {activeTab === "assignments" && (
                <AssignmentsTable rows={active} onReturn={handleReturn} onAskReturn={handleAskToReturn} />
              )}
              {activeTab === "history" && (
                <HistoryTable rows={history} />
              )}
            </div>
          )}
        </div>
      </div>

      {approveModal && (
        <ApproveModal
          assignment={approveModal.assignment}
          authHeaders={authHeaders}
          onClose={() => setApproveModal(null)}
          onApproved={() => { setApproveModal(null); fetchAssignments(); }}
        />
      )}

      {confirm && (
        <ConfirmModal {...confirm} onClose={() => setConfirm(null)} />
      )}

      <ImportAssignmentsModal
        isOpen={importModal}
        onClose={() => setImportModal(false)}
        authHeaders={authHeaders}
        onImported={fetchAssignments}
      />
    </Layout>
  );
};

const TabBtn = ({ label, count, countStyle, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
      active ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700"
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? countStyle : "bg-slate-100 text-slate-400"}`}>
        {count}
      </span>
    )}
  </button>
);

const EmptyRow = ({ cols, message }) => (
  <tr>
    <td colSpan={cols} className="px-6 py-16 text-center text-sm text-slate-400 font-semibold">
      {message}
    </td>
  </tr>
);

const Th = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{children}</th>
);

const RequestsTable = ({ rows, onApprove, onReject }) => {
  const sorted = [...rows].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return (
  <table className="w-full min-w-200">
    <thead className="bg-slate-50">
      <tr>
        <Th>Employee</Th><Th>Requested Item</Th><Th>Tentative Asset</Th>
        <Th>Quantity</Th><Th>Request Date</Th><Th>Actions</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {sorted.length === 0
        ? <EmptyRow cols={6} message="No pending requests" />
        : sorted.map((a) => (
          <tr key={a._id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
              <p className="font-semibold text-slate-800">{a.requestedBy?.name || "-"}</p>
              <p className="text-xs text-slate-400">{a.requestedBy?.email}</p>
            </td>
            <td className="px-6 py-4 text-sm font-medium text-slate-700">{a.unitId?.name || "-"}</td>
            <td className="px-6 py-4 font-mono text-sm text-slate-500">{a.assetId?.tag || "-"}</td>
            <td className="px-6 py-4 text-sm text-slate-400 max-w-48 truncate">1</td>
            <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">{fmtDate(a.createdAt)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReject(a)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Deny
                </button>
                <button
                  onClick={() => onApprove(a)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-brand rounded-lg hover:bg-brand/90 transition-colors shadow-sm shadow-brand/20"
                >
                  Approve
                </button>
              </div>
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>
  );
};

const AssignmentsTable = ({ rows, onReturn, onAskReturn }) => (
  <table className="w-full min-w-200">
    <thead className="bg-slate-50">
      <tr>
        <Th>Employee</Th><Th>Item</Th><Th>Asset Tag</Th>
        <Th>Assigned By</Th><Th>Assigned On</Th><Th>Actions</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {rows.length === 0
        ? <EmptyRow cols={6} message="No active assignments" />
        : rows.map((a) => (
          <tr key={a._id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 font-semibold text-slate-800">{a.assignedTo?.name || "-"}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{a.unitId?.name || "-"}</td>
            <td className="px-6 py-4 font-mono text-sm text-slate-700">{a.assetId?.tag || "-"}</td>
            <td className="px-6 py-4 text-sm text-slate-400">{a.assignedBy?.name || "-"}</td>
            <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">{fmtDate(a.assignedAt)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAskReturn(a)}
                  className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap"
                >
                  Ask to Return
                </button>
                <button
                  onClick={() => onReturn(a)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-brand rounded-lg hover:bg-brand/90 transition-colors whitespace-nowrap"
                >
                  Process Return
                </button>
              </div>
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>
);

const HistoryTable = ({ rows }) => (
  <table className="w-full min-w-200">
    <thead className="bg-slate-50">
      <tr>
        <Th>Employee</Th><Th>Item</Th><Th>Asset Tag</Th>
        <Th>Date</Th><Th>Note</Th><Th>Status</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {rows.length === 0
        ? <EmptyRow cols={6} message="No history yet" />
        : rows.map((a) => (
          <tr key={a._id} className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 font-semibold text-slate-800">{a.requestedBy?.name || "-"}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{a.unitId?.name || "-"}</td>
            <td className="px-6 py-4 font-mono text-sm text-slate-500">{a.assetId?.tag || "-"}</td>
            <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
              {a.status === "Returned" ? fmtDate(a.returnedAt) : fmtDate(a.updatedAt || a.createdAt)}
            </td>
            <td className="px-6 py-4 text-sm text-slate-400 max-w-48 truncate">{a.adminNote || a.note || "-"}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[a.status]}`}>{a.status}</span>
            </td>
          </tr>
        ))
      }
    </tbody>
  </table>
);

export default AdminAssignmentsPage;
