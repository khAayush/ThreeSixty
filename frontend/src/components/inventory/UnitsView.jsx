import { TagIcon } from "@heroicons/react/24/outline";

const UnitsView = ({ units, onViewAssets, onAddStock }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    {units.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <TagIcon className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-semibold">No units yet</p>
        <p className="text-sm">Click "New Unit" to add items</p>
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
            {units.map((unit) => {
              const sc = unit.statusCounts || {};
              return (
                <tr key={unit._id} className="hover:bg-slate-50 transition-colors">
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
                  <td className="px-6 py-4">
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

export default UnitsView;
