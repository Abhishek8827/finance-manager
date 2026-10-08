// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";

// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: "autoUpdate",
//       includeAssets: ["favicon.ico"],
//       manifest: {
//         name: "FinanceManager",
//         short_name: "FM",
//         description: "Personal Finance & Expense Tracker",
//         theme_color: "#4f46e5",
//         background_color: "#09090b",
//         display: "standalone",
//         orientation: "portrait",
//         start_url: "/",
//         scope: "/",
//         icons: [
//           {
//             src: "https://cdn-icons-png.flaticon.com/512/10149/10149458.png",
//             sizes: "192x192",
//             type: "image/png",
//             purpose: "any maskable",
//           },
//           {
//             src: "https://cdn-icons-png.flaticon.com/512/10149/10149458.png",
//             sizes: "512x512",
//             type: "image/png",
//             purpose: "any maskable",
//           },
//         ],
//       },
//       workbox: {
//         globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
//       },
//     }),
//   ],
//   server: { port: 5173 },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt", // Requires user to refresh when an update is available
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "pwa-192.png", "pwa-512.png"],
      manifest: {
        name: "Finance Manager",
        short_name: "Finance",
        description: "Personal Income, Expense & Loan Tracker",
        theme_color: "#4f46e5",
        background_color: "#09090b",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "https://cdn-icons-png.flaticon.com/512/10149/10149458.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "https://cdn-icons-png.flaticon.com/512/10149/10149458.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cache UI files
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 3000000,
        // NEVER cache API requests (avoids data syncing bugs)
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  server: { port: 5173 },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
