import { CubeIcon } from "@heroicons/react/24/outline";
import { STATUS_COLORS } from "./inventoryUtils";

const EmployeeAssetsView = ({ assets, categoryType, onViewDetail }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    {assets.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <CubeIcon className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-semibold">No assets found</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-105">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Tag</th>
              <th className="px-6 py-3">Status</th>
              {categoryType === "fixed" && <th className="px-6 py-3">Location</th>}
              {categoryType === "assignable" && <th className="px-6 py-3">Assigned</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((asset) => (
              <tr
                key={asset._id}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onViewDetail(asset._id)}
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-bold text-slate-800">{asset.tag}</span>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default EmployeeAssetsView;
