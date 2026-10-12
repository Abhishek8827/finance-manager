const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const {
  TOKEN_ISSUER,
  TOKEN_AUDIENCE,
  getJwtSecret,
  getAccessPassword,
  authNotConfigured,
} = require("../middleware/appAccess");

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

router.post("/login", loginLimiter, (req, res) => {
  res.set("Cache-Control", "no-store");
  const configuredPassword = getAccessPassword();
  const secret = getJwtSecret();
  if (!configuredPassword || !secret) return authNotConfigured(res);

  const suppliedPassword = req.body?.password;
  if (typeof suppliedPassword !== "string" || suppliedPassword.length > 1024) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const expected = crypto
    .createHash("sha256")
    .update(configuredPassword)
    .digest();
  const actual = crypto.createHash("sha256").update(suppliedPassword).digest();
  if (!crypto.timingSafeEqual(expected, actual)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ sub: "app-user" }, secret, {
    algorithm: "HS256",
    expiresIn: "12h",
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  });
  return res.json({ token, expiresIn: 12 * 60 * 60 });
});

module.exports = router;
