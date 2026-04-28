import { PencilIcon, TrashIcon, CubeIcon } from "@heroicons/react/24/outline";
import { TYPE_COLORS } from "./inventoryUtils";

const CategoriesView = ({ categories, onManageUnits, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    {categories.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <CubeIcon className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-semibold">No categories yet</p>
        <p className="text-sm">Click "New Category" to get started</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-125">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Units</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800">{cat.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${TYPE_COLORS[cat.type]}`}>
                    {cat.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {cat.unitCount} Unit{cat.unitCount !== 1 ? "s" : ""}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onManageUnits(cat)}
                      className="px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-xs font-semibold hover:bg-brand/20 transition-colors"
                    >
                      Manage Units
                    </button>
                    <button
                      onClick={() => onEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(cat)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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

export default CategoriesView;
