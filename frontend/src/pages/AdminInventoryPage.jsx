import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { PlusIcon, ChevronRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

import { Modal, Field, ModalActions } from "../components/inventory/InventoryModal";
import AssetDetailModal from "../components/inventory/AssetDetailModal";
import ConfirmModal from "../components/ConfirmModal";
import CategoriesView from "../components/inventory/CategoriesView";
import UnitsView from "../components/inventory/UnitsView";
import AssetsView from "../components/inventory/AssetsView";
import { inputCls } from "../components/inventory/inventoryUtils";

const API_URL = import.meta.env.VITE_API_URL;

const AdminInventoryPage = ({ onLogout }) => {
  const token = localStorage.getItem("token");
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

  // ── Render ────────────────────────────────────────────────────────────────────

  const pageTitle =
    view === "categories" ? "Inventory"
    : view === "units" ? `${selectedCategory?.name} — Units`
    : `${selectedUnit?.name} — Assets`;

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
            {view !== "categories" && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Back
              </button>
            )}
            {view === "categories" && (
              <button
                onClick={() => openModal("createCategory")}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4" /> New Category
              </button>
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
                <option value="fixed">Fixed — location-based, cannot be assigned</option>
                <option value="assignable">Assignable — can be assigned to employees</option>
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
                <option value="fixed">Fixed — location-based, cannot be assigned</option>
                <option value="assignable">Assignable — can be assigned to employees</option>
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
        <Modal title={`New Unit — ${selectedCategory?.name}`} onClose={closeModal}>
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
        <Modal title={`Add Stock — ${modal.data?.name}`} onClose={closeModal}>
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
        <Modal title={`Change Status — ${modal.data?.tag}`} onClose={closeModal}>
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
        <Modal title={`Set Location — ${modal.data?.tag}`} onClose={closeModal}>
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

      {modal?.type === "assetDetail" && (
        <AssetDetailModal asset={modal.data?.asset} logs={modal.data?.logs} onClose={closeModal} />
      )}

      {confirm && (
        <ConfirmModal
          {...confirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </Layout>
  );
};

export default AdminInventoryPage;
