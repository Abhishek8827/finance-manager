const test = require("node:test");
const assert = require("node:assert/strict");
const { escapeRegex } = require("../utils/regex");

test("escapeRegex neutralises regex metacharacters", () => {
  assert.equal(escapeRegex("a(b"), "a\\(b");
  assert.equal(escapeRegex("50*"), "50\\*");
  assert.equal(escapeRegex("[x]"), "\\[x\\]");
});

test("escaped search text matches literally", () => {
  const needle = "c++ (books)";
  const pattern = new RegExp(escapeRegex(needle), "i");
  assert.ok(pattern.test("Bought C++ (Books) today"));
  assert.ok(!pattern.test("cxx books"));
});

test("plain text is unchanged", () => {
  assert.equal(escapeRegex("groceries"), "groceries");
});
