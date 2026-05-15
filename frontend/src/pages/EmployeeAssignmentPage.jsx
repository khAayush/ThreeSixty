import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { CubeIcon, MagnifyingGlassIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL;

const EmployeeAssignmentPage = ({ onLogout }) => {
  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [catalog, setCatalog] = useState([]);
  const [pendingUnitIds, setPendingUnitIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCatId, setFilterCatId] = useState("");
  const [requestModal, setRequestModal] = useState(null); // { unit }
  const [submitting, setSubmitting] = useState(false);

  const authFetch = (path, opts = {}) =>
    fetch(`${API_URL}${path}`, { credentials: "include", headers: authHeaders, ...opts });

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, myRes] = await Promise.all([
          authFetch("/inventory/browse"),
          authFetch("/assignments/my"),
        ]);
        if (catRes.status === 401 || myRes.status === 401) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
          return;
        }
        const [catData, myData] = await Promise.all([catRes.json(), myRes.json()]);
        if (catData.success) setCatalog(catData.data);
        if (myData.success) {
          const ids = new Set(
            myData.data
              .filter((a) => a.status === "Pending")
              .map((a) => a.unitId?._id || a.unitId)
          );
          setPendingUnitIds(ids);
        }
      } catch {
        toast.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog
      .filter((cat) => !filterCatId || cat._id === filterCatId)
      .map((cat) => ({
        ...cat,
        units: cat.units.filter((u) => !q || u.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.units.length > 0);
  }, [catalog, filterCatId, search]);

  const openRequest = (unit) => {
    setRequestModal({ unit });
  };

  const submitRequest = async () => {
    if (!requestModal) return;
    setSubmitting(true);
    try {
      const res = await authFetch("/assignments/request", {
        method: "POST",
        body: JSON.stringify({ unitId: requestModal.unit._id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Request submitted successfully!");
        setPendingUnitIds((prev) => new Set([...prev, requestModal.unit._id]));
        setRequestModal(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout onLogout={onLogout}>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Request Asset</h1>
          <p className="text-sm text-slate-500 mt-0.5">Browse available assets and submit a request</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              value={filterCatId}
              onChange={(e) => setFilterCatId(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand cursor-pointer"
            >
              <option value="">All Categories</option>
              {catalog.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CubeIcon className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-semibold">No assets found</p>
            {(search || filterCatId) && (
              <button onClick={() => { setSearch(""); setFilterCatId(""); }} className="mt-2 text-sm text-brand hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filtered.map((cat) => (
              <section key={cat._id}>
                <h2 className="text-base font-bold text-slate-700 mb-4">{cat.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cat.units.map((unit) => (
                    <UnitCard
                      key={unit._id}
                      unit={unit}
                      isPending={pendingUnitIds.has(unit._id)}
                      onRequest={() => openRequest(unit)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Request modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Request</p>
                <h3 className="text-lg font-bold text-slate-800">{requestModal.unit.name}</h3>
              </div>
              <button onClick={() => setRequestModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-slate-500">
                Submit a request for{" "}
                <span className="font-semibold text-slate-700">{requestModal.unit.name}</span>.
                An admin will review and assign a specific unit to you.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 pb-5">
              <button
                onClick={() => setRequestModal(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const UnitCard = ({ unit, isPending, onRequest }) => {
  const isOOS = unit.availableCount === 0;
  const disabled = isOOS || isPending;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
          <CubeIcon className="w-5 h-5 text-brand" />
        </div>
        {isOOS ? (
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Out of stock</span>
        ) : isPending ? (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Requested</span>
        ) : (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {unit.availableCount} available
          </span>
        )}
      </div>

      <p className="font-semibold text-slate-800 leading-snug">{unit.name}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>Total: <span className="font-semibold text-slate-700">{unit.totalCount}</span></span>
        <span>
          Available:{" "}
          <span className={`font-semibold ${isOOS ? "text-slate-400" : "text-emerald-600"}`}>
            {unit.availableCount}
          </span>
        </span>
      </div>

      <button
        disabled={disabled}
        onClick={onRequest}
        className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
          isOOS
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : isPending
            ? "bg-amber-50 text-amber-600 cursor-not-allowed"
            : "bg-brand text-white hover:bg-brand/90"
        }`}
      >
        {isOOS ? "Out of Stock" : isPending ? "Request Pending" : "Request"}
      </button>
    </div>
  );
};

export default EmployeeAssignmentPage;
