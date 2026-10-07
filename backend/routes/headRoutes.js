const express = require("express");
const Head = require("../models/Head");
const Entry = require("../models/Entry");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { account } = req.query;
    if (!account) return res.status(400).json({ error: "Account required" });
    const heads = await Head.find({ account, archived: { $ne: true } }).sort({
      type: 1,
      name: 1,
    });
    res.json(heads);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { account, name, type, color, emoji } = req.body;
    if (!account || !name || !type)
      return res.status(400).json({ error: "account, name, type required" });
    const head = await Head.create({
      account,
      name: name.trim(),
      type,
      color: color || "#6366f1",
      emoji: emoji || "",
    });
    res.status(201).json(head);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const head = await Head.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!head) return res.status(404).json({ error: "Not found" });
    res.json(head);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const inUse = await Entry.exists({ head: req.params.id, deletedAt: null });
    if (inUse) {
      await Head.findByIdAndUpdate(req.params.id, { archived: true });
      return res.json({ archived: true });
    }
    await Head.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
