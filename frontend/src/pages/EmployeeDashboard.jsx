import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import toast from "react-hot-toast";
import {
  CubeIcon,
  TicketIcon,
  ClockIcon,
  ArrowRightIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";

const API_URL = import.meta.env.VITE_API_URL;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

const ASSIGNMENT_STATUS_STYLES = {
  Pending:  "bg-amber-50 text-amber-600",
  Approved: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-red-50 text-red-500",
  Returned: "bg-slate-100 text-slate-500",
};

const EmployeeDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [assignments, setAssignments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [asgRes, tktRes] = await Promise.all([
          fetch(`${API_URL}/assignments/my`,                          { credentials: "include", headers: authHeaders }),
          fetch(`${API_URL}/tickets?userId=${currentUser._id || ""}`, { credentials: "include", headers: authHeaders }),
        ]);
        if (asgRes.status === 401) { window.location.href = "/login"; return; }
        const [asgData, tktData] = await Promise.all([asgRes.json(), tktRes.json()]);
        if (asgData.success) setAssignments(asgData.data);
        if (tktData.success !== false) setTickets(Array.isArray(tktData) ? tktData : (tktData.data || []));
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side derived counts
  const assignedCount  = assignments.filter((a) => a.status === "Approved").length;
  const pendingCount   = assignments.filter((a) => a.status === "Pending").length;
  const ticketCount    = tickets.length;

  // Active requests to show in the list (Pending + Approved, most recent first, max 5)
  const activeRequests = assignments
    .filter((a) => a.status === "Pending" || a.status === "Approved")
    .slice(0, 5);

  // Most recent ticket
  const latestTicket = tickets[0] || null;

  return (
    <Layout onLogout={onLogout}>
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm">Monitor your personal assets and requests</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
          <StatCard label="Assigned Assets"  value={loading ? "-" : assignedCount} icon={CubeIcon}    iconBg="bg-blue-50"   iconColor="text-blue-500"   />
          <StatCard label="Pending Requests" value={loading ? "-" : pendingCount}  icon={ClockIcon}   iconBg="bg-orange-50" iconColor="text-orange-500" />
          <StatCard label="Tickets Created"  value={loading ? "-" : ticketCount}   icon={TicketIcon}  iconBg="bg-yellow-50" iconColor="text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Requested / Assigned Assets */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-100">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-500" />
                My Assets
              </h3>
              <button
                onClick={() => navigate("/request-asset")}
                className="text-[10px] font-bold text-brand/70 uppercase tracking-widest hover:text-brand transition-colors flex items-center gap-1"
              >
                Request New <PlusIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                </div>
              ) : activeRequests.length > 0 ? (
                activeRequests.map((a) => (
                  <div
                    key={a._id}
                    className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-brand/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-brand transition-colors">
                        <CubeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{a.unitId?.name || "-"}</p>
                        {a.assetId?.tag && (
                          <p className="text-[10px] font-mono text-slate-400">{a.assetId.tag}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block text-[10px] font-black uppercase px-2 py-1 rounded-md mb-1 ${ASSIGNMENT_STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">{fmtDate(a.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <InboxIcon className="w-8 h-8 opacity-20" />
                  <p className="text-sm italic">No active requests</p>
                </div>
              )}
            </div>

            {activeRequests.length > 0 && (
              <button
                onClick={() => navigate("/my-assets")}
                className="mt-4 shrink-0 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand transition-colors"
              >
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Latest Ticket */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-100 flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-amber-500" />
                Latest Ticket Activity
              </h3>
              <button
                onClick={() => navigate("/my-tickets")}
                className="text-[10px] font-bold text-brand/70 uppercase tracking-widest hover:text-brand transition-colors flex items-center gap-1"
              >
                View All <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
              </div>
            ) : latestTicket ? (
              <div
                onClick={() => navigate("/my-tickets")}
                className="mt-2 flex items-start gap-4 p-5 bg-amber-50/30 rounded-2xl border border-amber-100/50 cursor-pointer hover:bg-amber-50 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <TicketIcon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{latestTicket.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                      latestTicket.status === "Open"
                        ? "text-amber-600 bg-white border border-amber-100"
                        : "text-emerald-600 bg-white border border-emerald-100"
                    }`}>
                      {latestTicket.status}
                    </span>
                  </div>
                  {latestTicket.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{latestTicket.description}</p>
                  )}
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-4">
                    Created: {fmtDate(latestTicket.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <InboxIcon className="w-8 h-8 opacity-20" />
                <p className="text-sm italic">No tickets yet</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </Layout>
  );
};

export default EmployeeDashboard;
