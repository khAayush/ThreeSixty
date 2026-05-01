import { ChevronRightIcon, TagIcon } from "@heroicons/react/24/outline";

const EmployeeUnitsView = ({ units, onSelect }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    {units.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <TagIcon className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-semibold">No units in this category</p>
      </div>
    ) : (
      <div className="divide-y divide-slate-100">
        {units.map((unit) => {
          const sc = unit.statusCounts || {};
          return (
            <button
              key={unit._id}
              onClick={() => onSelect(unit)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{unit.name}</p>
                  <p className="font-mono text-xs text-slate-400">{unit.baseTag}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-slate-500">{unit.totalCount} total</span>
                <span className="text-emerald-600">{sc.Healthy || 0} healthy</span>
                <ChevronRightIcon className="w-4 h-4 text-slate-300" />
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

export default EmployeeUnitsView;
