const express = require("express");
const { z } = require("zod");
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");
const Entry = require("../models/Entry");
const { rupeesToPaise } = require("../utils/money");

const router = express.Router();

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const entrySchema = z.object({
  account: z.string().min(1),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  date: ymd,
  head: z.string().min(1),
  summary: z.string().max(300).optional().default(""),
  mode: z.enum(["cash", "online"]),
});

const transferSchema = z
  .object({
    fromAccount: z.string().min(1),
    fromMode: z.enum(["cash", "online"]),
    toAccount: z.string().min(1),
    toMode: z.enum(["cash", "online"]),
    amount: z.number().positive(),
    date: ymd,
    summary: z.string().max(300).optional().default(""),
  })
  .refine((d) => !(d.fromAccount === d.toAccount && d.fromMode === d.toMode), {
    message: "Source and destination cannot be identical",
  });

router.get("/", async (req, res, next) => {
  try {
    const {
      account,
      type,
      head,
      mode,
      from,
      to,
      search,
      cursor,
      limit = "30",
    } = req.query;
    if (!account) return res.status(400).json({ error: "Account is required" });

    const q = { account, deletedAt: null };
    if (type) q.type = type;
    if (head) q.head = head;
    if (mode) q.mode = mode;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = from;
      if (to) q.date.$lte = to;
    }
    if (search) q.summary = { $regex: search, $options: "i" };

    if (cursor) {
      const [cDate, cId] = cursor.split("|");
      q.$or = [
        { date: { $lt: cDate } },
        { date: cDate, _id: { $lt: new mongoose.Types.ObjectId(cId) } },
      ];
    }

    const lim = Math.min(parseInt(limit, 10) || 30, 100);
    const items = await Entry.find(q)
      .sort({ date: -1, _id: -1 })
      .limit(lim + 1)
      .populate("head", "name type color emoji")
      .populate("transferToAccount", "name")
      .lean();

    const hasMore = items.length > lim;
    const sliced = hasMore ? items.slice(0, lim) : items;
    const nextCursor = hasMore
      ? `${sliced[sliced.length - 1].date}|${sliced[sliced.length - 1]._id}`
      : null;

    res.json({ items: sliced, nextCursor });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const p = entrySchema.parse(req.body);
    const entry = await Entry.create({
      account: p.account,
      type: p.type,
      amountPaise: rupeesToPaise(p.amount),
      date: p.date,
      head: p.head,
      summary: p.summary || "",
      mode: p.mode,
      isOutgoing: p.type === "expense",
    });
    const populated = await entry.populate("head", "name type color emoji");
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
});

router.post("/transfer", async (req, res, next) => {
  try {
    const p = transferSchema.parse(req.body);
    const transferId = randomUUID();
    const amountPaise = rupeesToPaise(p.amount);

    const docs = [
      {
        account: p.fromAccount,
        type: "transfer",
        isOutgoing: true,
        mode: p.fromMode,
        amountPaise,
        date: p.date,
        summary: p.summary || "",
        transferId,
        transferToAccount: p.toAccount,
        transferToMode: p.toMode,
      },
      {
        account: p.toAccount,
        type: "transfer",
        isOutgoing: false,
        mode: p.toMode,
        amountPaise,
        date: p.date,
        summary: p.summary || "",
        transferId,
        transferToAccount: p.fromAccount,
        transferToMode: p.fromMode,
      },
    ];

    const created = await Entry.insertMany(docs);
    res.status(201).json({ transferId, entries: created });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await Entry.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.type === "transfer") {
      return res
        .status(400)
        .json({ error: "Use transfer endpoint for transfers" });
    }

    const { type, amount, date, head, summary, mode } = req.body;
    if (type) {
      existing.type = type;
      existing.isOutgoing = type === "expense";
    }
    if (amount !== undefined) existing.amountPaise = rupeesToPaise(amount);
    if (date) existing.date = date;
    if (head) existing.head = head;
    if (mode) existing.mode = mode;
    if (summary !== undefined) existing.summary = summary;
    await existing.save();
    const populated = await existing.populate("head", "name type color emoji");
    res.json(populated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: "Not found" });

    if (entry.type === "transfer" && entry.transferId) {
      await Entry.updateMany(
        { transferId: entry.transferId },
        { $set: { deletedAt: new Date() } },
      );
    } else {
      entry.deletedAt = new Date();
      await entry.save();
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/restore", async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: "Not found" });

    if (entry.type === "transfer" && entry.transferId) {
      await Entry.updateMany(
        { transferId: entry.transferId },
        { $set: { deletedAt: null } },
      );
    } else {
      entry.deletedAt = null;
      await entry.save();
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
