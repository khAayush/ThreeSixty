import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { showLoading, showSuccess, showError } from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;

const AdminLostAndFoundPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  // Fetch all reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/lostandfound`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch reports");

      const data = await res.json();
      if (data.success) {
        setAllItems(data.data);
      }
    } catch (err) {
      showError("Failed to load reports");
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (itemId) => {
    const toastId = showLoading("Resolving item...");
    setResolvingId(itemId);
    try {
      const res = await fetch(`${API_URL}/lostandfound/${itemId}/resolve`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) throw new Error("Failed to resolve item");

      // Refresh the list
      await fetchReports();
      showSuccess("Item resolved successfully!", toastId);
    } catch (err) {
      showError("Failed to resolve item", toastId);
      console.error("Resolve item error:", err);
    } finally {
      setResolvingId(null);
    }
  };

  // Filter items based on tab and search
  const filteredItems = allItems.filter(item => {
    const matchesTab = activeTab === "active" ? item.status === "open" : (item.status === "resolved" || item.status === "cancelled");
    const matchesSearch = item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.createdByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Count stats
  const lostActiveCount = allItems.filter(item => item.type === "lost" && item.status === "open").length;
  const foundActiveCount = allItems.filter(item => item.type === "found" && item.status === "open").length;

  return (
    <Layout onLogout={onLogout} >
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Page Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Lost & Found</h2>
            <p className="text-slate-500 text-sm mt-1">
              Manage lost and found items reported by employees
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <StatCard
            label="Active Lost Items"
            value={lostActiveCount.toString()}
            icon={MagnifyingGlassIcon}
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />
          <StatCard
            label="Active Found Items"
            value={foundActiveCount.toString()}
            icon={CheckCircleIcon}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "active" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Active Items ({allItems.filter(i => i.status === "open").length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "history" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            History ({allItems.filter(i => i.status !== "open").length})
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full" />
              </div>
              <p className="text-slate-500">Loading reports...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-brand text-[10px] font-bold rounded-md tracking-wider">
                        {item.assetCode}
                      </span>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                          item.type === "lost" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                        }`}>
                          {item.type.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                          item.status === "open" ? "bg-blue-50 text-blue-500" : 
                          item.status === "resolved" ? "bg-emerald-50 text-emerald-500" :
                          "bg-slate-50 text-slate-500"
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-slate-800 mb-2">{item.assetName}</h4>
                    {item.description && (
                      <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                    )}

                    <div className="flex items-center text-slate-500 text-sm mb-6">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>{item.location}</span>
                    </div>

                    <div className="border-t border-slate-50 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reported by</span>
                        <span className="font-bold text-slate-700">{item.createdByName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date</span>
                        <span className="font-bold text-slate-600">{item.createdAt}</span>
                      </div>
                      {item.resolvedByName && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Resolved by</span>
                            <span className="font-bold text-slate-700">{item.resolvedByName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Resolved on</span>
                            <span className="font-bold text-slate-600">{item.resolvedAt}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                    {item.status === "open" && (
                      <button
                        onClick={() => handleResolve(item.id)}
                        disabled={resolvingId === item.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-sm shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="lg:col-span-2 py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                  <MagnifyingGlassIcon className="w-12 h-12 mb-2 opacity-20" />
                  <p>{activeTab === "active" ? "No active items found" : "No history found"}</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </Layout>
  );
};

export default AdminLostAndFoundPage;
