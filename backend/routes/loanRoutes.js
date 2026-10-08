const express = require("express");
const { z } = require("zod");
const Loan = require("../models/Loan");
const Entry = require("../models/Entry");
const { rupeesToPaise } = require("../utils/money");
const { todayIST } = require("../utils/date");

const router = express.Router();

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const loanCreateSchema = z.object({
  account: z.string().min(1),
  person: z.string().min(1).max(60),
  direction: z.enum(["lent", "borrowed"]),
  mode: z.enum(["cash", "online"]),
  amount: z.number().positive(),
  date: ymd,
  dueDate: ymd.optional().nullable(),
  note: z.string().max(300).optional().default(""),
});

const loanUpdateSchema = z.object({
  person: z.string().min(1).max(60).optional(),
  direction: z.enum(["lent", "borrowed"]).optional(),
  mode: z.enum(["cash", "online"]).optional(),
  amount: z.number().positive().optional(),
  date: ymd.optional(),
  dueDate: ymd.optional().nullable(),
  note: z.string().max(300).optional(),
});

// GET all loans
router.get("/", async (req, res, next) => {
  try {
    const { account } = req.query;
    if (!account) return res.status(400).json({ error: "Account required" });
    const items = await Loan.find({ account })
      .sort({ status: 1, date: -1 })
      .lean();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// CREATE loan + wallet movement
router.post("/", async (req, res, next) => {
  try {
    const p = loanCreateSchema.parse(req.body);
    const amountPaise = rupeesToPaise(p.amount);

    const loan = await Loan.create({
      account: p.account,
      person: p.person,
      direction: p.direction,
      amountPaise,
      date: p.date,
      dueDate: p.dueDate || null,
      note: p.note || "",
      status: "pending",
    });

    // Lent = money leaves wallet; Borrowed = money enters wallet
    const isOutgoing = p.direction === "lent";
    const entry = await Entry.create({
      account: p.account,
      type: "loan",
      isOutgoing,
      mode: p.mode,
      amountPaise,
      date: p.date,
      summary: `${p.direction === "lent" ? "Lent to" : "Borrowed from"} ${p.person}`,
      loanId: loan._id,
      deletedAt: null,
    });

    res.status(201).json({ loan, entry });
  } catch (e) {
    next(e);
  }
});

// UPDATE pending loan (rewrite linked open entry)
router.put("/:id", async (req, res, next) => {
  try {
    const p = loanUpdateSchema.parse(req.body);
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    if (loan.status === "returned") {
      return res
        .status(400)
        .json({
          error: "Cannot edit a settled loan. Delete and recreate if needed.",
        });
    }

    // Apply loan field updates
    if (p.person !== undefined) loan.person = p.person;
    if (p.direction !== undefined) loan.direction = p.direction;
    if (p.amount !== undefined) loan.amountPaise = rupeesToPaise(p.amount);
    if (p.date !== undefined) loan.date = p.date;
    if (p.dueDate !== undefined) loan.dueDate = p.dueDate;
    if (p.note !== undefined) loan.note = p.note;
    await loan.save();

    // Update the initial wallet entry linked to this loan (the open one, not settle entry)
    const openEntry = await Entry.findOne({
      loanId: loan._id,
      deletedAt: null,
      // open leg: lent => outgoing, borrowed => incoming
    }).sort({ createdAt: 1 });

    if (openEntry) {
      const direction = loan.direction;
      openEntry.isOutgoing = direction === "lent";
      openEntry.amountPaise = loan.amountPaise;
      openEntry.date = loan.date;
      openEntry.summary = `${direction === "lent" ? "Lent to" : "Borrowed from"} ${loan.person}`;
      if (p.mode) openEntry.mode = p.mode;
      await openEntry.save();
    }

    res.json({ loan, entry: openEntry });
  } catch (e) {
    next(e);
  }
});

// SETTLE loan
router.post("/:id/settle", async (req, res, next) => {
  try {
    const mode = req.body.mode || "online";
    const date = req.body.date || todayIST();

    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: "Not found" });
    if (loan.status === "returned")
      return res.status(400).json({ error: "Already settled" });

    // Settling lent = money returns (incoming)
    // Settling borrowed = you pay back (outgoing)
    const isOutgoing = loan.direction === "borrowed";

    const entry = await Entry.create({
      account: loan.account,
      type: "loan",
      isOutgoing,
      amountPaise: loan.amountPaise,
      date,
      summary: `${loan.direction === "lent" ? "Received back from" : "Returned to"} ${loan.person}`,
      mode,
      loanId: loan._id,
      deletedAt: null,
    });

    loan.status = "returned";
    loan.settledEntryId = entry._id;
    loan.settledOn = date;
    await loan.save();

    res.json({ ok: true, entry, loan });
  } catch (e) {
    next(e);
  }
});

// DELETE loan + all linked wallet entries (soft or hard)
router.delete("/:id", async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: "Not found" });

    // Soft-delete linked entries so wallet reverses cleanly in summary
    await Entry.updateMany(
      { loanId: loan._id },
      { $set: { deletedAt: new Date() } },
    );

    await Loan.findByIdAndDelete(loan._id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
