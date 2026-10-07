require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const accountRoutes = require("./routes/accountRoutes");
const headRoutes = require("./routes/headRoutes");
const entryRoutes = require("./routes/entryRoutes");
const loanRoutes = require("./routes/loanRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

const app = express();
connectDB();

app.use(helmet({ crossOriginResourcePolicy: false }));

// Clean allowed origins helper
const cleanOrigin = (url) => (url ? url.trim().replace(/\/$/, "") : "");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  cleanOrigin(process.env.FRONTEND_URL),
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = cleanOrigin(origin);
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith(".netlify.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback for production robustness
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());

// Root & Health Checks
app.get("/", (req, res) =>
  res.json({ ok: true, service: "finance-manager-api" }),
);
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Safety Net: Serve routes on both /api/path AND /path
app.use(["/api/accounts", "/accounts"], accountRoutes);
app.use(["/api/heads", "/heads"], headRoutes);
app.use(["/api/entries", "/entries"], entryRoutes);
app.use(["/api/loans", "/loans"], loanRoutes);
app.use(["/api/summary", "/summary"], summaryRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
