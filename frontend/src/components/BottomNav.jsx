import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    path: "/",
    label: "Summary",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    path: "/entries",
    label: "Entries",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop nav in header area */}
      <div className="hidden sm:flex fixed top-0 right-4 h-14 items-center gap-1 z-50">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                location.pathname === item.path
                  ? "text-indigo-600"
                  : "text-gray-400"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
