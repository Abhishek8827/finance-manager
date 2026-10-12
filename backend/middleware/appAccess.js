const jwt = require("jsonwebtoken");

const TOKEN_ISSUER = "finance-manager";
const TOKEN_AUDIENCE = "finance-manager-api";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function getAccessPassword() {
  const password = process.env.APP_ACCESS_PASSWORD;
  return password && password.length >= 12 ? password : null;
}

function authNotConfigured(res) {
  return res.status(503).json({ error: "App access is not configured" });
}

function requireAppAccess(req, res, next) {
  res.set("Cache-Control", "private, no-store");
  const secret = getJwtSecret();
  if (!getAccessPassword() || !secret) {
    return authNotConfigured(res);
  }

  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/);
  if (!match) return res.status(401).json({ error: "Unlock required" });

  try {
    req.appAccess = jwt.verify(match[1], secret, {
      algorithms: ["HS256"],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    return next();
  } catch {
    return res.status(401).json({ error: "Session expired; unlock again" });
  }
}

module.exports = {
  TOKEN_ISSUER,
  TOKEN_AUDIENCE,
  getJwtSecret,
  getAccessPassword,
  authNotConfigured,
  requireAppAccess,
};
