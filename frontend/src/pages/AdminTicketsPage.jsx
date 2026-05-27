import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  PaperClipIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { showLoading, showSuccess, showError } from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;

const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const getStatusBadge = (status) => {
  switch (status) {
    case "Open":
      return "bg-amber-100 text-amber-700";
    case "Closed":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TicketsPage = ({ onLogout }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [activeTab, setActiveTab] = useState("Open");
  const [search, setSearch] = useState("");

  const currentAdmin = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tickets`);
      if (!res.ok) throw new Error("Failed to fetch tickets");

      const data = await res.json();
      setTickets(data);
      if (data.length > 0) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      showError("Failed to load tickets");
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailOnMobile(true);
    setResolveNote("");
  };

  const handleNotifyVisit = async () => {
    if (!selectedTicket) return;
    setNotifying(true);
    const toastId = showLoading("Sending visit notification...");
    try {
      const res = await fetch(`${API_URL}/tickets/${selectedTicket._id}/notify-visit`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send notification");
      showSuccess("Visit notification sent to user!", toastId);
    } catch (err) {
      showError("Failed to send notification", toastId);
      console.error("Notify visit error:", err);
    } finally {
      setNotifying(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket || !resolveNote.trim()) {
      showError("Please enter a resolution note");
      return;
    }

    setResolving(true);
    const toastId = showLoading("Resolving ticket...");
    try {
      const res = await fetch(`${API_URL}/tickets/${selectedTicket._id}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: resolveNote,
          resolvedBy: currentAdmin.name,
        }),
      });

      if (!res.ok) throw new Error("Failed to resolve ticket");

      const updatedTicket = await res.json();
      setSelectedTicket(updatedTicket);
      setTickets(tickets.map((t) => (t._id === updatedTicket._id ? updatedTicket : t)));
      setResolveNote("");
      showSuccess("Ticket resolved successfully!", toastId);
    } catch (err) {
      showError("Failed to resolve ticket", toastId);
      console.error("Resolve ticket error:", err);
    } finally {
      setResolving(false);
    }
  };

  return (
    <Layout onLogout={onLogout} >
      <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-slate-800">Support Tickets</h2>
          <p className="text-slate-500 text-sm">
            Manage and respond to employee support requests
          </p>
        </div>

        <div className="flex-1 flex overflow-hidden bg-slate-50  gap-6">
          <div
            className={`
            w-full lg:w-1/3 shrink-0 flex flex-col overflow-hidden pr-2
            ${showDetailOnMobile ? "hidden lg:flex" : "flex"}
          `}
          >
            <div className="relative shrink-0 mb-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tickets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
              />
            </div>

            <div className="flex gap-2 border-b border-slate-200 shrink-0 bg-slate-50/50">
              <button
                onClick={() => setActiveTab("Open")}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "Open"
                    ? "border-brand text-brand"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                Open ({tickets.filter(t => t.status === "Open").length})
              </button>
              <button
                onClick={() => setActiveTab("Closed")}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "Closed"
                    ? "border-brand text-brand"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                Closed ({tickets.filter(t => t.status === "Closed").length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Loading tickets...
                </div>
              ) : tickets.filter(t => t.status === activeTab && (!search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.userName?.toLowerCase().includes(search.toLowerCase()))).length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No {activeTab.toLowerCase()} tickets{search ? " matching your search" : ""}
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {tickets
                    .filter(t => t.status === activeTab && (!search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.userName?.toLowerCase().includes(search.toLowerCase())))
                    .sort((a, b) => {
                      if (activeTab === "Closed") {
                        return new Date(b.resolvedDate || b.updatedAt) - new Date(a.resolvedDate || a.updatedAt);
                      }
                      return new Date(a.createdAt) - new Date(b.createdAt);
                    })
                    .map((ticket) => {
                    const isActive = selectedTicket?._id === ticket._id;
                    return (
                      <button
                        key={ticket._id}
                        onClick={() => handleSelectTicket(ticket)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex gap-3 items-start ${
                          isActive
                            ? "border-brand bg-brand/5 shadow-sm"
                            : "border-slate-200 bg-white hover:border-brand/40 hover:shadow-sm"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-500 text-white flex items-center justify-center text-sm font-semibold shrink-0 shadow-inner overflow-hidden">
                          {ticket.userImage ? (
                            <img src={ticket.userImage} alt={ticket.userName} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(ticket.userName)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 mb-1 truncate">
                            {ticket.title}
                          </h4>
                          <p className="text-sm text-slate-500 mb-3 truncate">
                            {ticket.userName}
                          </p>
                          <div className="flex justify-between items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadge(ticket.status)}`}
                            >
                              {ticket.status}
                            </span>
                            <span className="text-xs font-medium text-slate-400 shrink-0">
                              {formatDate(ticket.status === "Closed" ? (ticket.resolvedDate || ticket.updatedAt) : ticket.createdAt)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div
            className={`
            flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-y-auto h-fit max-h-full
            ${!showDetailOnMobile ? "hidden lg:flex" : "flex"}
          `}
          >
            {selectedTicket ? (
              <>
                <div className="lg:hidden p-4 border-b border-slate-100 shrink-0">
                  <button
                    onClick={() => setShowDetailOnMobile(false)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-brand text-sm font-semibold"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back to tickets</span>
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-slate-500 text-white flex items-center justify-center text-lg font-semibold shadow-inner shrink-0 overflow-hidden">
                        {selectedTicket.userImage ? (
                          <img src={selectedTicket.userImage} alt={selectedTicket.userName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(selectedTicket.userName)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">
                          {selectedTicket.userName}
                        </h3>
                        <p className="text-slate-400 text-sm mt-0.5">
                          Created: {formatDate(selectedTicket.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold tracking-wide capitalize shrink-0 ${
                        selectedTicket.status === "Open"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-emerald-50 text-emerald-500"
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                    {selectedTicket.title}
                  </h2>
                  <p className="mt-4 text-slate-500 leading-relaxed text-base">
                    {selectedTicket.description || "No additional description provided."}
                  </p>
                </div>

                {selectedTicket.status === "Open" ? (
                  <div className="border-t border-slate-100 mt-auto">
                    <div className="p-6 md:p-8 bg-slate-50/30">
                      <textarea
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        placeholder="Enter resolution note..."
                        className="w-full bg-slate-100 border-none rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none min-h-25 shadow-inner"
                      />
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={handleResolveTicket}
                          disabled={resolving || !resolveNote.trim()}
                          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <CheckCircleIcon className="w-5 h-5 stroke-2" />
                          <span>{resolving ? "Resolving..." : "Resolve"}</span>
                        </button>
                        <button
                          onClick={handleNotifyVisit}
                          disabled={notifying}
                          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm bg-brand text-white hover:bg-brand hover:shadow-brand disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <BuildingOfficeIcon className="w-5 h-5 stroke-2" />
                          <span>{notifying ? "Sending..." : "Request Visit"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col border-t border-slate-100 mt-auto">
                    <div className="p-6 md:p-8">
                      <h4 className="font-bold text-slate-800 text-lg mb-2">
                        Resolution Note
                      </h4>
                      <p className="text-slate-500 leading-relaxed">
                        {selectedTicket.note || "No resolution note was provided."}
                      </p>
                    </div>
                    <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between text-sm text-slate-500 font-medium gap-2">
                      <span>
                        <strong className="text-slate-700">Resolved on:</strong>{" "}
                        {selectedTicket.resolvedDate ? formatDate(selectedTicket.resolvedDate) : "N/A"}
                      </span>
                      <span>
                        <strong className="text-slate-700">Resolved By:</strong>{" "}
                        {selectedTicket.resolvedBy || selectedTicket.closedBy }
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 p-8">
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketsPage;
