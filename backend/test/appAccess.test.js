const { after, before, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const http = require("node:http");
const authRoutes = require("../routes/authRoutes");
const { requireAppAccess } = require("../middleware/appAccess");

const TEST_PASSWORD = "test-only-finance-password";
const TEST_SECRET = "test-only-jwt-secret-not-used-outside-tests-123456";
const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use("/auth", authRoutes);
app.get("/private", requireAppAccess, (req, res) =>
  res.json({ subject: req.appAccess.sub }),
);

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

beforeEach(() => {
  process.env.APP_ACCESS_PASSWORD = TEST_PASSWORD;
  process.env.JWT_SECRET = TEST_SECRET;
});

test("data routes reject requests without a bearer token", async () => {
  const response = await fetch(`${baseUrl}/private`);
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("a valid unlock token grants access to the protected route", async () => {
  const login = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: TEST_PASSWORD }),
  });
  assert.equal(login.status, 200);
  assert.equal(login.headers.get("cache-control"), "no-store");
  const { token } = await login.json();
  assert.ok(token);

  const response = await fetch(`${baseUrl}/private`, {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { subject: "app-user" });
});

test("an incorrect password is rejected", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: "wrong-password" }),
  });
  assert.equal(response.status, 401);
});

test("missing credentials fail closed for login and protected data", async () => {
  delete process.env.APP_ACCESS_PASSWORD;
  delete process.env.JWT_SECRET;

  const [login, data] = await Promise.all([
    fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: TEST_PASSWORD }),
    }),
    fetch(`${baseUrl}/private`),
  ]);
  assert.equal(login.status, 503);
  assert.equal(data.status, 503);
});
