import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import { initTheme } from "./hooks/useTheme";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import PWAManager from "./components/PWAManager";
import "./index.css";

initTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
          <PWAManager />
          <Toaster position="top-center" richColors closeButton />
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
