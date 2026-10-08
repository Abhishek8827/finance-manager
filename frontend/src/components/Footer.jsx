import React from "react";

export default function Footer() {
  return (
    <footer className="mt-10 pb-20 sm:pb-6 text-center">
      <p className="text-xs text-gray-400">
        Made with ❤️ by{" "}
        <span className="font-medium text-gray-500">Abhishek Wani</span>
      </p>
      <p className="text-[10px] text-gray-300 mt-1">
        © {new Date().getFullYear()} FinanceManager
      </p>
    </footer>
  );
}
