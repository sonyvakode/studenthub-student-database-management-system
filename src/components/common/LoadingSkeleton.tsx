import React from 'react';

export const TableLoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-20 shrink-0"></div>
          <div className="h-4 bg-slate-200 rounded w-44 shrink-0"></div>
          <div className="h-4 bg-slate-200 rounded w-24 shrink-0"></div>
          <div className="h-4 bg-slate-200 rounded w-36 flex-1"></div>
          <div className="h-4 bg-slate-200 rounded w-40 shrink-0"></div>
          <div className="h-4 bg-slate-200 rounded w-28 shrink-0"></div>
          <div className="h-4 bg-slate-200 rounded w-16 shrink-0"></div>
        </div>
      ))}
    </div>
  );
};

export const CardLoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-200 rounded w-24"></div>
          <div className="h-8 bg-slate-200 rounded w-16"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
      </div>
    </div>
  );
};
