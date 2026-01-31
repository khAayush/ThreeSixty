import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowDownTrayIcon,
  PlusIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import AdminSidebar from '../../components/AdminSidebar';
import AddAssetModal from '../../components/AddAssetModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import AssetViewModal from '../../components/AssetViewModal';

const API_URL = 'http://localhost:8000/api';

const AssetsContent = () => {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryOpen, setCategoryOpen] = useState(false);
  // view modal states
  const [viewOpen, setViewOpen] = useState(false);
  const [viewAssetId, setViewAssetId] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/assets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return setAssets([]);
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load assets', e);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // debug help: log selected category and sample asset/category shapes
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.debug('Assets filter state:', {
        selectedCategory,
        categoriesSample: categories.slice(0, 5),
        assetsSample: assets.slice(0, 5),
      });
    }
  }, [selectedCategory, categories, assets]);

  // ensure we always display a stable, human-friendly category label
  const selectedCategoryName =
    selectedCategory === 'all'
      ? 'All Categories'
      : (
          categories.find(
            (c) =>
              String(c._id) === String(selectedCategory) ||
              String(c.id) === String(selectedCategory) ||
              String(c.name).toLowerCase() === String(selectedCategory).toLowerCase()
          )?.name || String(selectedCategory)
        );

  const handleSave = async (payload) => {
    // call API to create or update asset
    try {
      const token = localStorage.getItem('token');
      const isEdit = Boolean(editing && editing._id);
      const url = isEdit ? `${API_URL}/assets/${editing._id}` : `${API_URL}/assets`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to save asset', err);
        return;
      }
      // refresh list and clear editing
      await fetchAssets();
      setEditing(null);
      setOpen(false);
    } catch (e) {
      console.error('Failed to save asset', e);
    }
  };

  const handleEdit = (asset) => {
    setEditing(asset);
    setOpen(true);
  };

  const handleView = (asset) => {
    setViewAssetId(asset && (asset._id || asset.id || asset));
    setViewOpen(true);
  }; 

  const filteredAssets = assets.filter((row) => {
    const q = (search || '').trim().toLowerCase();

    // derive category id and name in a few possible shapes
    const rowCatId = row.category ? (row.category._id || row.category.id || row.category) : null;
    const rowCatName = row.category ? (row.category.name || (typeof row.category === 'string' ? row.category : '')) : '';

    const catMatch =
      selectedCategory === 'all' ||
      (rowCatId && String(rowCatId) === String(selectedCategory)) ||
      (rowCatName && String(rowCatName).toLowerCase() === String(selectedCategory).toLowerCase());

    if (!q) return catMatch;

    const name = (row.name || '').toLowerCase();
    const id = (row.assetId || '').toLowerCase();
    const cat = (rowCatName || '').toString().toLowerCase();
    return catMatch && (name.includes(q) || id.includes(q) || cat.includes(q));
  });

  const handleDelete = (asset) => {
    setAssetToDelete(asset);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/assets/${assetToDelete._id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to delete asset', err);
        return;
      }
      await fetchAssets();
    } catch (e) {
      console.error('Failed to delete asset', e);
    } finally {
      setConfirmOpen(false);
      setAssetToDelete(null);
    }
  };

  return (
    <main className="flex-1 px-8 py-6 space-y-5">
      {/* Header */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Assets Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage and track all your organization&apos;s assets
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white hover:bg-gray-50">
            <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
            Import CSV
          </button>
          <>
            <button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-1.5" />
              Add Asset
            </button>
            <AddAssetModal
              isOpen={open}
              onClose={() => {
                setOpen(false);
                setEditing(null);
              }}
              onSave={handleSave}
              initialData={editing}
            />
          </>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setCategoryOpen((s) => !s)}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-700"
          >
            <span>{selectedCategoryName}</span>
            <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-400" />
          </button>
          {categoryOpen && (
            <div className="absolute z-40 mt-2 bg-white border border-gray-100 rounded-md shadow-md w-56">
              <div
                onClick={() => {
                  setSelectedCategory('all');
                  setCategoryOpen(false);
                }}
                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              >
                All Categories
              </div>
              {categories.map((c) => (
                <div
                  key={c._id || c.id || c.name}
                  onClick={() => {
                    // store a string id or name to ensure stable rendering
                    setSelectedCategory(String(c._id || c.id || c.name));
                    setCategoryOpen(false);
                  }}
                  className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  {c.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 mx-4">
          <div className="flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-[#f9fafb] text-xs text-gray-500">
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="flex-1 bg-transparent outline-none text-xs text-gray-700"
            />
          </div>
        </div>
      </section>

      {/* Assets table */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-4">Asset Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Asset ID</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((row) => (
                  <tr key={row._id}>
                    <td className="py-2 pr-4 text-gray-800">{row.name}</td>
                    <td className="py-2 pr-4 text-gray-700">
                      {(row.category && (row.category.name || row.category)) || '-'}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{row.assetId || '-'}</td>
                    <td className="py-2 pr-4 text-gray-700">{row.assetType || '-'}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-[11px] text-blue-600">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 pr-2">
                      <div className="flex items-center justify-end space-x-2 text-gray-500">
                        <button onClick={() => handleView(row)} className="p-1.5 rounded-lg hover:bg-gray-100">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 rounded-lg hover:bg-gray-100"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <AssetViewModal
        isOpen={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewAssetId(null);
        }}
        assetId={viewAssetId}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setAssetToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete asset"
        message={
          assetToDelete
            ? `Delete asset "${assetToDelete.assetId}"? This cannot be undone.`
            : 'Delete this asset?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </main>
  );
};

const Assets = () => (
  <div className="min-h-screen flex bg-[#f5f7fb] text-gray-800">
    <AdminSidebar active="Assets" />
    <div className="flex-1 flex flex-col">
      {/* Top bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">ThreeSixty</span>
          <span className="text-gray-400">•</span>
          <span>Herald College Kathmandu</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <BellIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
              SB
            </div>
            <span className="text-sm text-gray-700">Sabina Bharati</span>
          </div>
        </div>
      </header>
      <AssetsContent />
    </div>
  </div>
);

export { AssetsContent };

export default Assets;
