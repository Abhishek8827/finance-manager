import React from "react";

export default function EmptyState({
  icon = "📊",
  title = "No data found",
  description = "Get started by adding your first entry",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        {description}
      </p>
    </div>
  );
}
