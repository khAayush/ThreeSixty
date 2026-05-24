import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ConfirmModal from "../components/ConfirmModal";
import ApproveModal from "../components/ApproveModal";
import toast from "react-hot-toast";
import {
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TicketIcon,
  ClockIcon,
  ArrowRightIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [approveModal, setApproveModal] = useState(null); // { assignment }

  const authFetch = (path, opts = {}) =>
    fetch(`${API_URL}${path}`, { credentials: "include", headers: authHeaders, ...opts });

  const fetchData = async () => {
    try {
      const [statsRes, reqRes, ticketRes] = await Promise.all([
        authFetch("/dashboard/stats"),
        authFetch("/assignments?status=Pending"),
        authFetch("/tickets"),
      ]);
      const [statsData, reqData, ticketData] = await Promise.all([
        statsRes.json(), reqRes.json(), ticketRes.json(),
      ]);
      if (statsData.success) setStats(statsData.data);
      if (reqData.success) setRequests(reqData.data.slice(0, 5));
      if (Array.isArray(ticketData)) {
        setTickets(ticketData.filter((t) => t.status === "Open").slice(0, 5));
      }
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = (req) => {
    setApproveModal({ assignment: req });
  };

  const handleDeny = (req) => {
    setConfirm({
      title: "Deny Request",
      message: `Deny ${req.requestedBy?.name}'s request for "${req.unitId?.name}"?`,
      confirmLabel: "Deny",
      danger: true,
      requireNote: true,
      notePlaceholder: "Reason for denial…",
      onConfirm: async (adminNote) => {
        const res = await authFetch(`/assignments/${req._id}/reject`, {
          method: "PATCH",
          body: JSON.stringify({ adminNote }),
        });
        const data = await res.json();
        if (data.success) { toast.success("Request denied"); fetchData(); }
        else toast.error(data.message);
      },
    });
  };

  const s = stats || {};

  return (
    <Layout onLogout={onLogout}>
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm">Monitor your organization's assets and requests</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
          <StatCard label="Total Assets"       value={loading ? "-" : s.totalAssets}     icon={CubeIcon}                iconBg="bg-blue-50"   iconColor="text-blue-500"   />
          <StatCard label="In Stock"            value={loading ? "-" : s.inStock}          icon={CheckCircleIcon}         iconBg="bg-emerald-50" iconColor="text-emerald-500" />
          <StatCard label="Assigned"            value={loading ? "-" : s.assigned}         icon={CubeIcon}                iconBg="bg-purple-50"  iconColor="text-purple-500"  />
          <StatCard label="Damaged / In Repair" value={loading ? "-" : s.damagedOrRepair}  icon={ExclamationTriangleIcon} iconBg="bg-red-50"     iconColor="text-red-500"    />
          <StatCard label="Open Tickets"        value={loading ? "-" : s.openTickets}      icon={TicketIcon}              iconBg="bg-amber-50"   iconColor="text-amber-500"   />
          <StatCard label="Pending Requests"    value={loading ? "-" : s.pendingRequests}  icon={ClockIcon}               iconBg="bg-orange-50"  iconColor="text-orange-500"  />
        </div>

        {/* Bottom two-column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Pending Asset Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-800">Pending Asset Requests</h3>
                <p className="text-slate-400 text-xs mt-0.5">Employee requests waiting for approval</p>
              </div>
              <button
                onClick={() => navigate("/assignments")}
                className="flex items-center gap-1 text-xs font-bold text-brand hover:text-brand/80 transition-colors uppercase tracking-wider"
              >
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-7 h-7 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                  <CheckCircleIcon className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm font-semibold">No pending requests</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <div key={req._id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 text-sm truncate">{req.requestedBy?.name || "-"}</p>
                          <p className="text-xs text-slate-400 truncate">{req.unitId?.name || "-"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{fmtDate(req.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDeny(req)}
                            className="text-xs font-bold text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                          >
                            Deny
                          </button>
                          <button
                            onClick={() => handleApprove(req)}
                            className="text-xs font-bold bg-brand text-white px-2.5 py-1.5 rounded-lg hover:bg-brand/90 shadow-sm transition-all flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5 stroke-2" />
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Open Tickets */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-800">Open Tickets</h3>
                <p className="text-slate-400 text-xs mt-0.5">Support tickets awaiting resolution</p>
              </div>
              <button
                onClick={() => navigate("/tickets")}
                className="flex items-center gap-1 text-xs font-bold text-brand hover:text-brand/80 transition-colors uppercase tracking-wider"
              >
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-7 h-7 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                  <ChatBubbleLeftEllipsisIcon className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm font-semibold">No open tickets</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <div key={ticket._id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 text-sm truncate">{ticket.title}</p>
                          <p className="text-xs text-slate-400 truncate">{ticket.userName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{fmtDate(ticket.createdAt)}</p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
                          Open
                        </span>
                      </div>
                      {ticket.description && (
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{ticket.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {approveModal && (
        <ApproveModal
          assignment={approveModal.assignment}
          authHeaders={authHeaders}
          onClose={() => setApproveModal(null)}
          onApproved={() => { setApproveModal(null); fetchData(); }}
        />
      )}

      {confirm && (
        <ConfirmModal {...confirm} onClose={() => setConfirm(null)} />
      )}
    </Layout>
  );
};

export default Dashboard;
