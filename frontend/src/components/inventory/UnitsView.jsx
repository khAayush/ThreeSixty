import { useState } from "react";
import { TagIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const UnitsView = ({ units, onViewAssets, onAddStock }) => {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? units.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.baseTag.toLowerCase().includes(query.toLowerCase())
      )
    : units;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-100">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search units"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <TagIcon className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-semibold">{units.length === 0 ? "No units yet" : "No results found"}</p>
          <p className="text-sm">{units.length === 0 ? 'Click "New Unit" to add items' : "Try a different search term"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Unit Name</th>
                <th className="px-6 py-3">Base Tag</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3 text-emerald-600">Healthy</th>
                <th className="px-6 py-3 text-amber-600">Damaged</th>
                <th className="px-6 py-3 text-blue-600">Repair</th>
                <th className="px-6 py-3 text-slate-400">Discarded</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((unit) => {
                const sc = unit.statusCounts || {};
                return (
                  <tr
                    key={unit._id}
                    onClick={() => onViewAssets(unit)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">{unit.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {unit.baseTag}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{unit.assetCount ?? unit.totalCount}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">{sc.Healthy || 0}</td>
                    <td className="px-6 py-4 font-semibold text-amber-600">{sc.Damaged || 0}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600">{sc["Out-For-Repair"] || 0}</td>
                    <td className="px-6 py-4 font-semibold text-slate-400">{sc.Discarded || 0}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onViewAssets(unit)}
                          className="px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-xs font-semibold hover:bg-brand/20 transition-colors"
                        >
                          View Assets
                        </button>
                        <button
                          onClick={() => onAddStock(unit)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          Add Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnitsView;
