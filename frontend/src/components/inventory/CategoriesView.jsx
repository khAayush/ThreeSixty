import { useState, useRef, useEffect } from "react";
import { PencilIcon, TrashIcon, CubeIcon, MagnifyingGlassIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { TYPE_COLORS } from "./inventoryUtils";

const RowMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-3.5 h-3.5 text-slate-400" />
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const CategoriesView = ({ categories, onManageUnits, onEdit, onDelete }) => {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.type.toLowerCase().includes(query.toLowerCase())
      )
    : categories;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-100">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <CubeIcon className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-semibold">{categories.length === 0 ? "No categories yet" : "No results found"}</p>
          <p className="text-sm">{categories.length === 0 ? 'Click "New Category" to get started' : "Try a different search term"}</p>
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
              {filtered.map((cat) => (
                <tr
                  key={cat._id}
                  onClick={() => onManageUnits(cat)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-semibold text-slate-800">{cat.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${TYPE_COLORS[cat.type]}`}>
                      {cat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {cat.unitCount} Unit{cat.unitCount !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onManageUnits(cat)}
                        className="px-3 py-1.5 bg-brand/10 text-brand rounded-lg text-xs font-semibold hover:bg-brand/20 transition-colors"
                      >
                        Manage Units
                      </button>
                      <RowMenu onEdit={() => onEdit(cat)} onDelete={() => onDelete(cat)} />
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

export default CategoriesView;
