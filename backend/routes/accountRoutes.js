const express = require("express");
const Account = require("../models/Account");

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
