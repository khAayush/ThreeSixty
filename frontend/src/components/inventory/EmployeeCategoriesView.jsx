import { ChevronRightIcon, CubeIcon } from "@heroicons/react/24/outline";
import { TYPE_COLORS } from "./inventoryUtils";

const EmployeeCategoriesView = ({ categories, onSelect }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    {categories.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <CubeIcon className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-semibold">No categories available</p>
      </div>
    ) : (
      <div className="divide-y divide-slate-100">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onSelect(cat)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{cat.name}</p>
                <p className="text-xs text-slate-400">
                  {cat.unitCount} Unit{cat.unitCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${TYPE_COLORS[cat.type]}`}>
                {cat.type}
              </span>
              <ChevronRightIcon className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

export default EmployeeCategoriesView;
