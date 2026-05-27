import React from 'react';

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow duration-200 ${onClick ? "cursor-pointer hover:border-brand/30" : ""}`}
  >
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
  </div>
);

export default StatCard;