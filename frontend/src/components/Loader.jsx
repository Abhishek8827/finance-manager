import React from "react";

export function Spinner({ size = "md" }) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizes[size]} border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton h-4 w-24 mb-3" />
          <div className="skeleton h-8 w-32" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-24 flex-1" />
          <div className="skeleton h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
