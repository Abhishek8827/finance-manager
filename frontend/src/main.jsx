// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "sonner";
// import { AppProvider } from "./context/AppContext";
// import App from "./App";
// import "./index.css";

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
//   },
// });

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <QueryClientProvider client={queryClient}>
//         <AppProvider>
//           <App />
//           <Toaster position="top-center" richColors />
//         </AppProvider>
//       </QueryClientProvider>
//     </BrowserRouter>
//   </React.StrictMode>,
// );

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import App from "./App";
import PWAManager from "./components/PWAManager";
import "./index.css";

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
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
          <PWAManager /> {/* Handles Install Prompts & Updates invisibly */}
          <Toaster position="top-center" richColors />
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
