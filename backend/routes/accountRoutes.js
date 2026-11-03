const express = require("express");
const Account = require("../models/Account");
const Entry = require("../models/Entry");
const Head = require("../models/Head");
const Loan = require("../models/Loan");
const Recurring = require("../models/Recurring");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const accounts = await Account.find({}, { pinHash: 0 }).sort({
      createdAt: 1,
    });
    res.json(accounts);
  } catch (e) {
    next(e);
  }
});

router.put("/:id/note", async (req, res, next) => {
  try {
    const note = typeof req.body.note === "string" ? req.body.note : "";
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { note: note.slice(0, 10000) },
      { new: true, runValidators: true, select: { pinHash: 0 } },
    );
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (error) {
    next(error);
  }
});

router.delete("/reset", async (req, res, next) => {
  try {
    await Promise.all([
      Entry.deleteMany({}),
      Head.deleteMany({}),
      Loan.deleteMany({}),
      Recurring.deleteMany({}),
      Account.updateMany({}, { $set: { note: "" } }),
    ]);
    res.json({ reset: true });
  } catch (error) {
    next(error);
  }
});

router.get("/public", async (req, res, next) => {
  try {
    const accounts = await Account.find(
      {},
      { name: 1, slug: 1, color: 1 },
    ).sort({ createdAt: 1 });
    res.json(accounts);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (color) update.color = color;
    const updated = await Account.findByIdAndUpdate(req.params.id, update, {
      new: true,
      select: { pinHash: 0 },
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ error: "Name required" });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const account = await Account.create({
      name,
      slug,
      color: req.body.color || "#6366f1",
    });
    res.status(201).json(account);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
