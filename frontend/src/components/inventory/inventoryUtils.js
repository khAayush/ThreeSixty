export const STATUS_COLORS = {
  Healthy: "bg-emerald-100 text-emerald-700",
  Damaged: "bg-amber-100 text-amber-700",
  "Out-For-Repair": "bg-blue-100 text-blue-700",
  Discarded: "bg-slate-100 text-slate-500",
};

export const TYPE_COLORS = {
  fixed: "bg-indigo-100 text-indigo-700",
  assignable: "bg-purple-100 text-purple-700",
};

export const inputCls =
  "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
