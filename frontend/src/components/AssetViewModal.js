import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8000/api';

const Row = ({ label, value }) => (
  <div className="py-2">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-sm text-gray-800">{value || '-'}</div>
  </div>
);

const AssetViewModal = ({ isOpen, onClose, assetId }) => {
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isOpen || !assetId) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/assets/${assetId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to load asset');
        }
        const data = await res.json();
        if (mounted) setAsset(data);
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      setAsset(null);
      setError(null);
      setLoading(false);
    };
  }, [isOpen, assetId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mx-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Asset details</h3>
            <p className="text-xs text-gray-500 mt-1">Full details from the server</p>
          </div>
          <div>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-6 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="py-6 text-center text-red-500">{error}</div>
          ) : !asset ? (
            <div className="py-6 text-center text-gray-500">No asset data</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Row label="Asset Name" value={asset.name} />
              <Row label="Category" value={(asset.category && (asset.category.name || asset.category)) || '-'} />
              <Row label="Asset ID" value={asset.assetId} />
              <Row label="Type" value={asset.assetType} />
              <Row label="Status" value={asset.status} />
              <Row label="Notes" value={asset.notes} />
              <Row label="Created" value={asset.createdAt ? new Date(asset.createdAt).toLocaleString() : '-'} />
              <Row label="Updated" value={asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : '-'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetViewModal;
