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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow tools like Postman / same-origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // during local dev, be permissive
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.json({ ok: true, service: "finance-manager" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/accounts", accountRoutes);
app.use("/api/heads", headRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/summary", summaryRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
