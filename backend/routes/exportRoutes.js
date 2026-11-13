const express = require("express");
const mongoose = require("mongoose");
const Entry = require("../models/Entry");
const Head = require("../models/Head");
const Loan = require("../models/Loan");
const Account = require("../models/Account");
const Recurring = require("../models/Recurring");
const { paiseToRupees } = require("../utils/money");

const router = express.Router();

const requireAccount = (req, res) => {
  const { account } = req.query;
  if (!account || !mongoose.Types.ObjectId.isValid(account)) {
    res.status(400).json({ error: "A valid account ID is required" });
    return null;
  }
  return account;
};

const csvCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const fileName = (account, extension, prefix = "finance-export") => {
  const slug = (account?.slug || account?.name || "account")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}-${slug}-${stamp}.${extension}`;
};

router.get("/export.csv", async (req, res, next) => {
  try {
    const accountId = requireAccount(req, res);
    if (!accountId) return;

    const [account, entries] = await Promise.all([
      Account.findById(accountId, { name: 1, slug: 1 }).lean(),
      Entry.find({ account: accountId, deletedAt: null })
        .sort({ date: -1, _id: -1 })
        .populate("head", "name type")
        .populate("transferToAccount", "name")
        .lean(),
    ]);
    if (!account) return res.status(404).json({ error: "Account not found" });

    const header = [
      "Date",
      "Type",
      "Category",
      "Direction",
      "Mode",
      "Amount (INR)",
      "Note",
      "Transfer To",
    ];

    const rows = entries.map((entry) => {
      const isOutgoing =
        entry.isOutgoing !== undefined
          ? entry.isOutgoing
          : entry.type === "expense";
      const category =
        entry.type === "transfer"
          ? "Transfer"
          : entry.head?.name || "Uncategorized";
      return [
        entry.date,
        entry.type,
        category,
        isOutgoing ? "out" : "in",
        entry.mode || "cash",
        paiseToRupees(entry.amountPaise || 0).toFixed(2),
        entry.summary || "",
        entry.transferToAccount?.name || "",
      ]
        .map(csvCell)
        .join(",");
    });

    // Excel needs the BOM to read ₹ / unicode notes correctly.
    const csv = `\uFEFF${[header.join(","), ...rows].join("\r\n")}\r\n`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName(account, "csv")}"`,
    );
    res.setHeader("Cache-Control", "no-store");
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
});

async function buildBackup(accountId) {
  const [account, entries, heads, loans, recurring] = await Promise.all([
    Account.findById(accountId, { pinHash: 0, pinFailedCount: 0, pinLockedUntil: 0 }).lean(),
    Entry.find({ account: accountId, deletedAt: null })
      .sort({ date: 1, _id: 1 })
      .lean(),
    Head.find({ account: accountId }).lean(),
    Loan.find({ account: accountId }).lean(),
    Recurring.find({ account: accountId }).lean(),
  ]);
  return { account, entries, heads, loans, recurring };
}

const sendBackup = async (req, res, next, prefix) => {
  try {
    const accountId = requireAccount(req, res);
    if (!accountId) return;

    const backup = await buildBackup(accountId);
    if (!backup.account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const payload = {
      format: "finance-manager-backup",
      version: 2,
      exportedAt: new Date().toISOString(),
      currency: "INR",
      ...backup,
    };

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName(backup.account, "json", prefix)}"`,
    );
    res.setHeader("Cache-Control", "no-store");
    return res.send(JSON.stringify(payload, null, 2));
  } catch (error) {
    return next(error);
  }
};

router.get("/export.json", (req, res, next) =>
  sendBackup(req, res, next, "finance-export"),
);

router.get("/backup.json", (req, res, next) =>
  sendBackup(req, res, next, "finance-backup"),
);

module.exports = router;
