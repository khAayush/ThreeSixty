import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { PlusIcon, ChevronRightIcon, ArrowLeftIcon, ClipboardDocumentListIcon, XMarkIcon, MagnifyingGlassIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { Modal, Field, ModalActions } from "../components/inventory/InventoryModal";
import AssetDetailModal from "../components/inventory/AssetDetailModal";
import ConfirmModal from "../components/ConfirmModal";
import CategoriesView from "../components/inventory/CategoriesView";
import UnitsView from "../components/inventory/UnitsView";
import AssetsView from "../components/inventory/AssetsView";
import { inputCls } from "../components/inventory/inventoryUtils";

const API_URL = import.meta.env.VITE_API_URL;

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

const ACTION_STYLES = {
  CATEGORY_CREATED: "bg-purple-50 text-purple-700",
  CATEGORY_DELETED: "bg-orange-50 text-orange-700",
  UNIT_CREATED:     "bg-emerald-50 text-emerald-700",
  STOCK_ADDED:      "bg-blue-50 text-blue-700",
  ASSET_DELETED:    "bg-red-50 text-red-600",
};

const ACTION_LABELS = {
  CATEGORY_CREATED: "Category Created",
  CATEGORY_DELETED: "Category Deleted",
  UNIT_CREATED:     "Unit Created",
  STOCK_ADDED:      "Stock Added",
  ASSET_DELETED:    "Asset Deleted",
};

const AdminInventoryPage = ({ onLogout }) => {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = currentUser.role === "manager";
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ── Navigation state ─────────────────────────────────────────────────────────
  const [view, setView] = useState("categories"); // "categories" | "units" | "assets"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // ── Data state ───────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [assets, setAssets] = useState([]);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [logsModal, setLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsQuery, setLogsQuery] = useState("");
  const [csvModal, setCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);       // parsed preview rows
  const [csvError, setCsvError] = useState("");
  const [csvResults, setCsvResults] = useState(null); // post-submit results
  const [csvSubmitting, setCsvSubmitting] = useState(false);

  // ── API helper ───────────────────────────────────────────────────────────────

  const inventoryFetch = async (path, opts = {}) => {
    const res = await fetch(`${API_URL}/inventory${path}`, {
      credentials: "include",
      headers: authHeaders,
      ...opts,
    });
    if (res.status === 401) {
      toast.error("Session expired. Please log in again.");
      window.location.href = "/login";
      return null;
    }
    return res;
  };

  // ── Data fetchers ────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await inventoryFetch("/categories");
      if (!res) return;
      const data = await res.json();
      if (data.success) setCategories(data.data);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async (categoryId) => {
    setLoading(true);
    try {
      const res = await inventoryFetch(`/categories/${categoryId}/units`);
      if (!res) return;
      const data = await res.json();
      if (data.success) setUnits(data.data);
    } catch {
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async (unitId) => {
    setLoading(true);
    try {
      const res = await inventoryFetch(`/units/${unitId}/assets`);
      if (!res) return;
      const data = await res.json();
      if (data.success) setAssets(data.data);
    } catch {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetDetail = async (assetId) => {
    try {
      const res = await inventoryFetch(`/assets/${assetId}`);
      if (!res) return;
      const data = await res.json();
      if (data.success) openModal("assetDetail", data.data);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to load asset details");
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const goToUnits = (category) => {
    setSelectedCategory(category);
    setView("units");
    fetchUnits(category._id);
  };

  const goToAssets = (unit) => {
    setSelectedUnit(unit);
    setView("assets");
    fetchAssets(unit._id);
  };

  const goBack = () => {
    if (view === "assets") {
      setView("units");
      fetchUnits(selectedCategory._id);
    } else {
      setView("categories");
      fetchCategories();
    }
  };

  // ── Modal helpers ────────────────────────────────────────────────────────────

  const openModal = (type, data = {}) => {
    setForm({ ...data });
    setModal({ type, data });
  };

  const closeModal = () => {
    setModal(null);
    setForm({});
  };

  // ── Category handlers ────────────────────────────────────────────────────────

  const handleCreateCategory = async () => {
    if (!form.name?.trim() || !form.type) return toast.error("Name and type are required");
    setSubmitting(true);
    try {
      const res = await inventoryFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ name: form.name, type: form.type, description: form.description }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) { toast.success("Category created"); fetchCategories(); closeModal(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to create category"); }
    finally { setSubmitting(false); }
  };

  const handleUpdateCategory = async () => {
    setSubmitting(true);
    try {
      const res = await inventoryFetch(`/categories/${modal.data._id}`, {
        method: "PUT",
        body: JSON.stringify({ name: form.name, type: form.type, description: form.description }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) { toast.success("Category updated"); fetchCategories(); closeModal(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to update category"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCategory = (cat) => {
    setConfirm({
      title: "Delete Category",
      message: `Delete "${cat.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await inventoryFetch(`/categories/${cat._id}`, { method: "DELETE" });
          if (!res) return;
          const data = await res.json();
          if (data.success) { toast.success("Category deleted"); fetchCategories(); }
          else toast.error(data.message);
        } catch { toast.error("Failed to delete category"); }
      },
    });
  };

  // ── Unit handlers ─────────────────────────────────────────────────────────────

  const handleCreateUnit = async () => {
    if (!form.name?.trim() || !form.baseTag?.trim() || !form.initialCount)
      return toast.error("All fields are required");
    setSubmitting(true);
    try {
      const res = await inventoryFetch("/units", {
        method: "POST",
        body: JSON.stringify({
          categoryId: selectedCategory._id,
          name: form.name,
          baseTag: form.baseTag.toUpperCase(),
          initialCount: parseInt(form.initialCount),
        }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) {
        toast.success(`Unit created with ${data.data.assetsCreated} asset(s)`);
        fetchUnits(selectedCategory._id);
        closeModal();
      } else toast.error(data.message);
    } catch { toast.error("Failed to create unit"); }
    finally { setSubmitting(false); }
  };

  const handleAddStock = async () => {
    const count = parseInt(form.additionalCount);
    if (!count || count < 1) return toast.error("Count must be at least 1");
    setSubmitting(true);
    try {
      const res = await inventoryFetch(`/units/${modal.data._id}/stock`, {
        method: "POST",
        body: JSON.stringify({ additionalCount: count }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) {
        toast.success(`Added ${data.data.assetsCreated} new asset(s)`);
        fetchUnits(selectedCategory._id);
        if (view === "assets" && selectedUnit?._id === modal.data._id) fetchAssets(modal.data._id);
        closeModal();
      } else toast.error(data.message);
    } catch { toast.error("Failed to add stock"); }
    finally { setSubmitting(false); }
  };

  // ── Asset handlers ───────────────────────────────────────────────────────────

  const handleUpdateStatus = async () => {
    if (!form.status) return toast.error("Please select a status");
    setSubmitting(true);
    try {
      const res = await inventoryFetch(`/assets/${modal.data._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: form.status }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) { toast.success("Status updated"); fetchAssets(selectedUnit._id); closeModal(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to update status"); }
    finally { setSubmitting(false); }
  };

  const handleUpdateLocation = async () => {
    setSubmitting(true);
    try {
      const res = await inventoryFetch(`/assets/${modal.data._id}/location`, {
        method: "PATCH",
        body: JSON.stringify({ location: form.location || null }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) { toast.success("Location updated"); fetchAssets(selectedUnit._id); closeModal(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to update location"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteAsset = (asset) => {
    setConfirm({
      title: "Delete Asset",
      message: `Delete asset "${asset.tag}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        try {
          const res = await inventoryFetch(`/assets/${asset._id}`, { method: "DELETE" });
          if (!res) return;
          const data = await res.json();
          if (data.success) { toast.success("Asset deleted"); fetchAssets(selectedUnit._id); }
          else toast.error(data.message);
        } catch { toast.error("Failed to delete asset"); }
      },
    });
  };

  const handleToggleLost = (asset) => {
    if (asset.isLost) {
      // Mark as found - no location needed, call directly
      (async () => {
        try {
          const res = await inventoryFetch(`/assets/${asset._id}/lost`, { method: "PATCH" });
          if (!res) return;
          const data = await res.json();
          if (data.success) { toast.success("Asset marked as found"); fetchAssets(selectedUnit._id); }
          else toast.error(data.message);
        } catch { toast.error("Failed to mark asset as found"); }
      })();
    } else {
      // Mark as lost - open modal to collect location
      openModal("markLost", asset);
    }
  };

  const handleMarkLost = async () => {
    if (!form.location?.trim()) return toast.error("Last known location is required");
    setSubmitting(true);
    try {
      const res = await inventoryFetch(`/assets/${modal.data._id}/lost`, {
        method: "PATCH",
        body: JSON.stringify({ location: form.location }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) { toast.success("Asset marked as lost"); fetchAssets(selectedUnit._id); closeModal(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to mark asset as lost"); }
    finally { setSubmitting(false); }
  };

  const openCsvModal = () => {
    setCsvRows([]);
    setCsvError("");
    setCsvResults(null);
    setCsvModal(true);
  };

  const parseCsv = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { rows: [], error: "CSV must have a header row and at least one data row" };

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\s_]/g, ""));
    const catIdx  = header.findIndex((h) => h === "category");
    const typeIdx = header.findIndex((h) => ["categorytype", "type"].includes(h));
    const nameIdx = header.findIndex((h) => ["unitname", "name"].includes(h));
    const tagIdx  = header.findIndex((h) => ["basetag", "tag"].includes(h));
    const qtyIdx  = header.findIndex((h) => ["quantity", "count", "initialcount"].includes(h));

    if ([catIdx, typeIdx, nameIdx, tagIdx, qtyIdx].some((i) => i === -1))
      return { rows: [], error: 'Headers must include: category, categoryType, unitName, baseTag, quantity' };

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.every((c) => !c)) continue;
      rows.push({
        category:     cols[catIdx]  || "",
        categoryType: cols[typeIdx] || "",
        unitName:     cols[nameIdx] || "",
        baseTag:      cols[tagIdx]  || "",
        quantity:     cols[qtyIdx]  || "",
      });
    }
    return { rows, error: "" };
  };

  const handleCsvFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setCsvError("Please upload a .csv file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows, error } = parseCsv(ev.target.result);
      setCsvError(error);
      setCsvRows(rows);
      setCsvResults(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const content = [
      "category,categoryType,unitName,baseTag,quantity",
      "Laptops,assignable,Dell Latitude,DELL-LAT,5",
      "Laptops,assignable,HP ProBook,HP-PRO,3",
      "Monitors,fixed,Samsung 27in,SAM-MON,10",
    ].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bulk_import_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvSubmit = async () => {
    if (!csvRows.length) return;
    setCsvSubmitting(true);
    try {
      const res = await inventoryFetch("/bulk-import", {
        method: "POST",
        body: JSON.stringify({ rows: csvRows }),
      });
      if (!res) return;
      const data = await res.json();
      if (data.success) {
        setCsvResults(data.data);
        fetchCategories();
        const ok = data.data.filter((r) => r.success).length;
        if (ok > 0) toast.success(`${ok} row(s) imported successfully`);
      } else toast.error(data.message);
    } catch { toast.error("CSV import failed"); }
    finally { setCsvSubmitting(false); }
  };

  const openLogsModal = async () => {
    setLogsModal(true);
    setLogsQuery("");
    setLogsLoading(true);
    try {
      const res = await inventoryFetch("/logs");
      if (!res) return;
      const data = await res.json();
      if (data.success) setLogs(data.data);
      else toast.error(data.message);
    } catch { toast.error("Failed to load logs"); }
    finally { setLogsLoading(false); }
  };

  // Render

  const pageTitle =
    view === "categories" ? "Inventory"
    : view === "units" ? `${selectedCategory?.name} - Units`
    : `${selectedUnit?.name} - Assets`;

  return (
    <Layout onLogout={onLogout}>
      <div className="p-6 space-y-6">

        {/* Header + breadcrumb */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1 text-sm text-slate-500 flex-wrap">
              <button
                onClick={() => { setView("categories"); fetchCategories(); }}
                className="hover:text-brand font-medium transition-colors"
              >
                Inventory
              </button>
              {view !== "categories" && (
                <>
                  <ChevronRightIcon className="w-3 h-3 shrink-0" />
                  <button
                    onClick={() => { setView("units"); fetchUnits(selectedCategory._id); }}
                    className="hover:text-brand font-medium transition-colors truncate max-w-40"
                  >
                    {selectedCategory?.name}
                  </button>
                </>
              )}
              {view === "assets" && (
                <>
                  <ChevronRightIcon className="w-3 h-3 shrink-0" />
                  <span className="text-slate-700 font-semibold truncate max-w-40">
                    {selectedUnit?.name}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isManager && (
              <button
                onClick={openLogsModal}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                <ClipboardDocumentListIcon className="w-4 h-4" /> View Logs
              </button>
            )}
            {view !== "categories" && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Back
              </button>
            )}
            {view === "categories" && (
              <>
                <button
                  onClick={openCsvModal}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" /> Import CSV
                </button>
                <button
                  onClick={() => openModal("createCategory")}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand/90 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" /> New Category
                </button>
              </>
            )}
            {view === "units" && (
              <button
                onClick={() => openModal("createUnit")}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4" /> New Unit
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          </div>
        ) : view === "categories" ? (
          <CategoriesView
            categories={categories}
            onManageUnits={goToUnits}
            onEdit={(cat) => openModal("editCategory", cat)}
            onDelete={handleDeleteCategory}
          />
        ) : view === "units" ? (
          <UnitsView
            units={units}
            onViewAssets={goToAssets}
            onAddStock={(unit) => openModal("addStock", unit)}
          />
        ) : (
          <AssetsView
            assets={assets}
            categoryType={selectedCategory?.type}
            onViewDetail={fetchAssetDetail}
            onChangeStatus={(asset) => openModal("changeStatus", asset)}
            onChangeLocation={(asset) =>
              openModal("changeLocation", { ...asset, location: asset.location || "" })
            }
            onDelete={handleDeleteAsset}
            onMarkLost={handleToggleLost}
          />
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────────── */}

      {modal?.type === "createCategory" && (
        <Modal title="New Category" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Name">
              <input type="text" placeholder="e.g. TV, Keyboard" value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls} autoFocus />
            </Field>
            <Field label="Type">
              <select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                <option value="">Select type…</option>
                <option value="fixed">Fixed - location-based, cannot be assigned</option>
                <option value="assignable">Assignable - can be assigned to employees</option>
              </select>
            </Field>
            <Field label="Description" hint="Optional">
              <textarea rows={2} placeholder="Brief description…" value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputCls} resize-none`} />
            </Field>
          </div>
          <ModalActions onCancel={closeModal} onConfirm={handleCreateCategory} confirmLabel="Create" loading={submitting} />
        </Modal>
      )}

      {modal?.type === "editCategory" && (
        <Modal title="Edit Category" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Name">
              <input type="text" value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls} autoFocus />
            </Field>
            <Field label="Type">
              <select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                <option value="fixed">Fixed</option>
                <option value="assignable">Assignable</option>
              </select>
            </Field>
            <Field label="Description" hint="Optional">
              <textarea rows={2} value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputCls} resize-none`} />
            </Field>
          </div>
          <ModalActions onCancel={closeModal} onConfirm={handleUpdateCategory} confirmLabel="Save Changes" loading={submitting} />
        </Modal>
      )}

      {modal?.type === "createUnit" && (
        <Modal title={`New Unit - ${selectedCategory?.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Unit Name">
              <input type="text" placeholder="e.g. Sony TV" value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls} autoFocus />
            </Field>
            <Field label="Base Tag" hint="Used to generate asset tags like SONY-TV-01, SONY-TV-02…">
              <input type="text" placeholder="e.g. SONY-TV" value={form.baseTag || ""}
                onChange={(e) => setForm({ ...form, baseTag: e.target.value.toUpperCase() })}
                className={`${inputCls} font-mono`} />
            </Field>
            <Field label="Initial Count">
              <input type="number" min="1" placeholder="e.g. 5" value={form.initialCount || ""}
                onChange={(e) => setForm({ ...form, initialCount: e.target.value })}
                className={inputCls} />
            </Field>
          </div>
          <ModalActions onCancel={closeModal} onConfirm={handleCreateUnit} confirmLabel="Create Unit" loading={submitting} />
        </Modal>
      )}

      {modal?.type === "addStock" && (
        <Modal title={`Add Stock - ${modal.data?.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Current total: <span className="font-semibold text-slate-700">{modal.data?.totalCount}</span> units
            </p>
            <Field label="Units to Add">
              <input type="number" min="1" placeholder="e.g. 5" value={form.additionalCount || ""}
                onChange={(e) => setForm({ ...form, additionalCount: e.target.value })}
                className={inputCls} autoFocus />
            </Field>
          </div>
          <ModalActions onCancel={closeModal} onConfirm={handleAddStock} confirmLabel="Add Stock" loading={submitting} />
        </Modal>
      )}

      {modal?.type === "changeStatus" && (
        <Modal title={`Change Status - ${modal.data?.tag}`} onClose={closeModal}>
          <Field label="New Status">
            <select
              value={form.status || modal.data?.status || ""}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            >
              {["Healthy", "Damaged", "Out-For-Repair", "Discarded"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <ModalActions onCancel={closeModal} onConfirm={handleUpdateStatus} confirmLabel="Update Status" loading={submitting} />
        </Modal>
      )}

      {modal?.type === "changeLocation" && (
        <Modal title={`Set Location - ${modal.data?.tag}`} onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Current: <span className="font-semibold text-slate-700">{modal.data?.location || "In-Store"}</span>
            </p>
            <Field label="New Location" hint="Leave blank to return to In-Store">
              <input type="text" placeholder="e.g. Meeting Room 01" value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputCls} autoFocus />
            </Field>
          </div>
          <ModalActions onCancel={closeModal} onConfirm={handleUpdateLocation} confirmLabel="Set Location" loading={submitting} />
        </Modal>
      )}

      {modal?.type === "markLost" && (
        <Modal title={`Mark as Lost - ${modal.data?.tag}`} onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              This will mark the asset as lost and create an open report visible in the Lost &amp; Found section.
            </p>
            <Field label="Last Known Location">
              <input
                type="text"
                placeholder="e.g. Conference Room B, Floor 3"
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputCls}
                autoFocus
              />
            </Field>
          </div>
          <ModalActions onCancel={closeModal} onConfirm={handleMarkLost} confirmLabel="Mark as Lost" loading={submitting} />
        </Modal>
      )}

      {modal?.type === "assetDetail" && (
        <AssetDetailModal asset={modal.data?.asset} logs={modal.data?.logs} onClose={closeModal} />
      )}

      {confirm && (
        <ConfirmModal
          {...confirm}
          onClose={() => setConfirm(null)}
        />
      )}

      {/* ── CSV Import Modal ─────────────────────────────────────────────────── */}
      {csvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
                  <ArrowUpTrayIcon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Bulk Import from CSV</h3>
                  <p className="text-xs text-slate-400">Creates or updates categories, units, and assets in one go</p>
                </div>
              </div>
              <button onClick={() => setCsvModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {!csvResults ? (
                <>
                  {/* Upload area */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <ArrowUpTrayIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 mb-1">Required columns:</p>
                    <p className="font-mono text-xs font-semibold text-slate-700 mb-3">category, categoryType, unitName, baseTag, quantity</p>
                    <p className="text-xs text-slate-400 mb-3">categoryType must be <span className="font-semibold">fixed</span> or <span className="font-semibold">assignable</span></p>
                    <div className="flex items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand/90 transition-colors">
                        Choose File
                        <input type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
                      </label>
                      <button onClick={downloadTemplate} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                        Download Template
                      </button>
                    </div>
                  </div>

                  {csvError && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                      <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                      {csvError}
                    </div>
                  )}

                  {/* Preview table */}
                  {csvRows.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{csvRows.length} row{csvRows.length !== 1 ? "s" : ""} detected</p>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              <th className="px-4 py-2.5">#</th>
                              <th className="px-4 py-2.5">Category</th>
                              <th className="px-4 py-2.5">Type</th>
                              <th className="px-4 py-2.5">Unit Name</th>
                              <th className="px-4 py-2.5">Base Tag</th>
                              <th className="px-4 py-2.5">Qty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {csvRows.map((row, i) => {
                              const miss = (v) => v || <span className="text-red-400 italic">missing</span>;
                              const validType = ["fixed","assignable"].includes(row.categoryType?.toLowerCase());
                              return (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-4 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                                  <td className="px-4 py-2.5 font-medium text-slate-800">{miss(row.category)}</td>
                                  <td className="px-4 py-2.5">
                                    {row.categoryType
                                      ? <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${validType ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-500"}`}>{row.categoryType}</span>
                                      : <span className="text-red-400 italic text-xs">missing</span>}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-700">{miss(row.unitName)}</td>
                                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{miss(row.baseTag)}</td>
                                  <td className="px-4 py-2.5 text-slate-700">{miss(row.quantity)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Results view */
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${csvResults.every(r => r.success) ? "bg-emerald-50" : "bg-amber-50"}`}>
                      <CheckCircleIcon className={`w-5 h-5 ${csvResults.every(r => r.success) ? "text-emerald-500" : "text-amber-500"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Import Complete</p>
                      <p className="text-xs text-slate-400">
                        {csvResults.filter(r => r.success).length} succeeded, {csvResults.filter(r => !r.success).length} failed
                      </p>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-2.5">Category</th>
                          <th className="px-4 py-2.5">Unit</th>
                          <th className="px-4 py-2.5">Base Tag</th>
                          <th className="px-4 py-2.5">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvResults.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-slate-600 text-xs">
                              {r.category}
                              {r.categoryCreated && <span className="ml-1 px-1 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded">NEW</span>}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-slate-800">{r.unitName}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{r.baseTag}</td>
                            <td className="px-4 py-2.5">
                              {r.success ? (
                                <span className="flex items-center gap-1 text-xs font-semibold">
                                  <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span className={r.action === "stock_added" ? "text-blue-600" : "text-emerald-600"}>
                                    {r.action === "stock_added" ? `+${r.assetsCreated} stock added` : `${r.assetsCreated} asset${r.assetsCreated !== 1 ? "s" : ""} created`}
                                  </span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                                  <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" /> {r.error}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3">
              <button onClick={() => setCsvModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                {csvResults ? "Close" : "Cancel"}
              </button>
              {!csvResults && (
                <button
                  onClick={handleCsvSubmit}
                  disabled={csvRows.length === 0 || !!csvError || csvSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {csvSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowUpTrayIcon className="w-4 h-4" />
                  )}
                  Import {csvRows.length > 0 ? `${csvRows.length} Unit${csvRows.length !== 1 ? "s" : ""}` : ""}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Inventory Logs Modal (manager only) ─────────────────────────────── */}
      {logsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Inventory Logs</h3>
                  <p className="text-xs text-slate-400">Category, unit, and stock changes - most recent first</p>
                </div>
              </div>
              <button onClick={() => setLogsModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-6 py-3 border-b border-slate-100 shrink-0">
              <div className="relative max-w-sm">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search logs"
                  value={logsQuery}
                  onChange={(e) => setLogsQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {logsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-7 h-7 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
                </div>
              ) : (() => {
                const q = logsQuery.trim().toLowerCase();
                const filteredLogs = q
                  ? logs.filter(
                      (l) =>
                        (l.entityName || "").toLowerCase().includes(q) ||
                        (ACTION_LABELS[l.actionType] || l.actionType).toLowerCase().includes(q) ||
                        (l.performedBy?.name || "").toLowerCase().includes(q)
                    )
                  : logs;
                return filteredLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-semibold">
                    {logs.length === 0 ? "No logs found" : "No results match your search"}
                  </div>
                ) : (
                  <table className="w-full min-w-200 text-sm">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Date & Time</th>
                        <th className="px-6 py-3">Entity</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3">Details</th>
                        <th className="px-6 py-3">By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{fmtDateTime(log.performedAt)}</td>
                          <td className="px-6 py-3 font-semibold text-slate-800">{log.entityName || "-"}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${ACTION_STYLES[log.actionType] || "bg-slate-100 text-slate-500"}`}>
                              {ACTION_LABELS[log.actionType] || log.actionType.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-slate-500 max-w-64 truncate">{log.details || "-"}</td>
                          <td className="px-6 py-3 text-slate-600 font-medium whitespace-nowrap">{log.performedBy?.name || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {logsQuery.trim()
                  ? `${logs.filter((l) => [l.entityName, ACTION_LABELS[l.actionType] || l.actionType, l.performedBy?.name].some((v) => (v || "").toLowerCase().includes(logsQuery.trim().toLowerCase()))).length} of ${logs.length} record${logs.length !== 1 ? "s" : ""}`
                  : `${logs.length} record${logs.length !== 1 ? "s" : ""}`}
              </span>
              <button onClick={() => setLogsModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminInventoryPage;
