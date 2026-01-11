import React, { useState, useEffect } from 'react';

const Field = ({ label, children }) => (
  <label className="block text-xs text-gray-700">
    <div className="mb-1 font-medium">{label}</div>
    {children}
  </label>
);

const API_URL = 'http://localhost:8000/api';

const AddAssetModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [status, setStatus] = useState('In-Stock');
  const [assetType, setAssetType] = useState('Fixed');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          // expect data to be array of { id, name }
          setCategories(data);
          if (data.length) setCategoryId(data[0].id || data[0]._id || data[0].name);
        } else {
          // fallback default
          setCategories(['Laptops', 'Monitors', 'Mobile Devices'].map((n) => ({ id: n, name: n })));
          setCategoryId('Laptops');
        }
      } catch (e) {
        setCategories(['Laptops', 'Monitors', 'Mobile Devices'].map((n) => ({ id: n, name: n })));
        setCategoryId('Laptops');
      }
    };

    if (isOpen) load();
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();

    let selectedCategory = categoryId;

    if (addingCategory && newCategory) {
      // try to create category on backend
      try {
        const res = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategory }),
        });
        if (res.ok) {
          const created = await res.json();
          selectedCategory = created.id || created._id || created.name;
        } else {
          // fallback to newCategory name
          selectedCategory = newCategory;
        }
      } catch (err) {
        selectedCategory = newCategory;
      }
    }

    const payload = {
      name,
      category: selectedCategory,
      assetId,
      status,
      assetType,
      notes,
    };

    try {
      if (onSave) await onSave(payload);
    } finally {
      // reset local state and close
      setName('');
      setAssetId('');
      setNewCategory('');
      setAddingCategory(false);
      setNotes('');
      setStatus('In-Stock');
      setAssetType('Fixed');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-3">Add Asset</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Asset Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
            />
          </Field>

          <Field label="Category">
            {!addingCategory ? (
              <div className="flex items-center space-x-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id || c._id || c.name} value={c.id || c._id || c.name}>
                      {c.name || c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-white"
                >
                  + New
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAddingCategory(false);
                    setNewCategory('');
                  }}
                  className="px-2 py-1 text-xs rounded-lg border border-gray-200 bg-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </Field>

          <Field label="Asset ID">
            <input
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
            />
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
            >
              <option>In-Stock</option>
              <option>Out-Of-Stock</option>
              <option>Damaged</option>
              <option>In-Repair</option>
              <option>Discarded</option>
            </select>
          </Field>

          <Field label="Asset Type">
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
            >
              <option>Fixed</option>
              <option>Flexible</option>
            </select>
          </Field>

          <Field label="Notes">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
            />
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
            Save asset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssetModal;
