const express = require("express");
const Loan = require("../models/Loan");
const Entry = require("../models/Entry");
const Head = require("../models/Head");
const { rupeesToPaise } = require("../utils/money");
const { todayIST } = require("../utils/date");

const router = express.Router();

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

router.post("/", async (req, res, next) => {
  try {
    const { account, person, direction, amount, date, dueDate, note } =
      req.body;
    if (!account || !person || !direction || !amount || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const loan = await Loan.create({
      account,
      person,
      direction,
      amountPaise: rupeesToPaise(amount),
      date,
      dueDate: dueDate || null,
      note: note || "",
    });
    res.status(201).json(loan);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/settle", async (req, res, next) => {
  try {
    const { mode, date } = req.body;
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: "Not found" });
    if (loan.status === "returned")
      return res.status(400).json({ error: "Already settled" });

    const type = loan.direction === "lent" ? "income" : "expense";
    let head = await Head.findOne({
      account: loan.account,
      name: "Returnable",
      type,
    });
    if (!head) {
      head = await Head.create({
        account: loan.account,
        name: "Returnable",
        type,
        emoji: "",
        color: "#64748b",
      });
    }

    const entry = await Entry.create({
      account: loan.account,
      type,
      amountPaise: loan.amountPaise,
      date: date || todayIST(),
      head: head._id,
      summary:
        loan.direction === "lent"
          ? `Received back from ${loan.person}`
          : `Returned to ${loan.person}`,
      mode: mode || "online",
      loanId: loan._id,
      isOutgoing: type === "expense",
    });

    loan.status = "returned";
    loan.settledEntryId = entry._id;
    loan.settledOn = date || todayIST();
    await loan.save();

    res.json({ ok: true, entry, loan });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
