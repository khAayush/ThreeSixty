import { useState } from "react";
import { CubeIcon, TrashIcon, MapPinIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { STATUS_COLORS } from "./inventoryUtils";

const withinThreeDays = (createdAt) =>
  Date.now() - new Date(createdAt).getTime() <= 3 * 24 * 60 * 60 * 1000;

const AssetsView = ({ assets, categoryType, onViewDetail, onChangeStatus, onChangeLocation, onDelete, onMarkLost }) => {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? assets.filter(
        (a) =>
          a.tag.toLowerCase().includes(query.toLowerCase()) ||
          a.status.toLowerCase().includes(query.toLowerCase()) ||
          (a.location || "").toLowerCase().includes(query.toLowerCase())
      )
    : assets;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Search bar */}
      <div className="px-6 py-3 border-b border-slate-100">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <CubeIcon className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-semibold">{assets.length === 0 ? "No assets found" : "No results found"}</p>
          {assets.length > 0 && <p className="text-sm">Try a different search term</p>}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-140">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Tag</th>
                <th className="px-6 py-3">Status</th>
                {categoryType === "fixed" && <th className="px-6 py-3">Location</th>}
                {categoryType === "assignable" && <th className="px-6 py-3">Assigned</th>}
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((asset) => (
                <tr
                  key={asset._id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onViewDetail(asset._id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800">{asset.tag}</span>
                      {asset.isLost && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
                          Lost
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[asset.status]}`}>
                      {asset.status}
                    </span>
                  </td>
                  {categoryType === "fixed" && (
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {asset.location || <span className="text-slate-400 italic">In-Store</span>}
                    </td>
                  )}
                  {categoryType === "assignable" && (
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold ${asset.isAssigned ? "text-purple-600" : "text-slate-400"}`}>
                        {asset.isAssigned ? "Yes" : "No"}
                      </span>
                    </td>
                  )}
                  {/* stopPropagation so row click doesn't trigger detail modal */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onChangeStatus(asset)}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                      >
                        Status
                      </button>
                      {categoryType === "fixed" && (
                        <button
                          onClick={() => onChangeLocation(asset)}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                        >
                          <MapPinIcon className="w-3 h-3" />
                          Location
                        </button>
                      )}
                      <button
                        onClick={() => onMarkLost(asset)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          asset.isLost
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        }`}
                      >
                        {asset.isLost ? "Mark Found" : "Mark Lost"}
                      </button>
                      {withinThreeDays(asset.createdAt) && !asset.isAssigned && (
                        <button
                          onClick={() => onDelete(asset)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete asset (available within 3 days of creation)"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssetsView;
