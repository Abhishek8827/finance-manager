const express = require("express");
const mongoose = require("mongoose");
const Entry = require("../models/Entry");
const Loan = require("../models/Loan");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const account = req.query.account;
    if (!account || !mongoose.Types.ObjectId.isValid(account)) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    const accountId = new mongoose.Types.ObjectId(account);
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );

    const curYear = parseInt(req.query.year, 10) || now.getFullYear();
    const curMonth = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const isAllTime = req.query.month === "all" || req.query.year === "all";

    const mStr = String(curMonth).padStart(2, "0");
    const lastDay = new Date(curYear, curMonth, 0).getDate();
    const monthStart = `${curYear}-${mStr}-01`;
    const monthEnd = `${curYear}-${mStr}-${String(lastDay).padStart(2, "0")}`;

    // --- All-time mode balances ---
    const allModeAgg = await Entry.aggregate([
      { $match: { account: accountId, deletedAt: null } },
      {
        $group: {
          _id: { mode: "$mode", isOutgoing: "$isOutgoing" },
          total: { $sum: "$amountPaise" },
        },
      },
    ]);

    let cashPaise = 0;
    let onlinePaise = 0;
    allModeAgg.forEach((r) => {
      const amt = r.total || 0;
      const mode = r._id.mode;
      if (mode === "cash") {
        r._id.isOutgoing ? (cashPaise -= amt) : (cashPaise += amt);
      } else if (mode === "online") {
        r._id.isOutgoing ? (onlinePaise -= amt) : (onlinePaise += amt);
      }
    });

    // --- Period match for income/expense ---
    const periodMatch = {
      account: accountId,
      deletedAt: null,
      type: { $in: ["income", "expense"] },
    };
    if (!isAllTime) {
      periodMatch.date = { $gte: monthStart, $lte: monthEnd };
    }

    const monthAgg = await Entry.aggregate([
      { $match: periodMatch },
      { $group: { _id: "$type", total: { $sum: "$amountPaise" } } },
    ]);

    let monthIncome = 0;
    let monthExpense = 0;
    monthAgg.forEach((r) => {
      if (r._id === "income") monthIncome = r.total;
      if (r._id === "expense") monthExpense = r.total;
    });

    // --- Previous month ---
    const prevDate = new Date(curYear, curMonth - 2, 1);
    const pY = prevDate.getFullYear();
    const pM = prevDate.getMonth() + 1;
    const pStr = String(pM).padStart(2, "0");
    const pLast = new Date(pY, pM, 0).getDate();
    const prevStart = `${pY}-${pStr}-01`;
    const prevEnd = `${pY}-${pStr}-${String(pLast).padStart(2, "0")}`;

    const prevAgg = await Entry.aggregate([
      {
        $match: {
          account: accountId,
          deletedAt: null,
          type: { $in: ["income", "expense"] },
          date: { $gte: prevStart, $lte: prevEnd },
        },
      },
      { $group: { _id: "$type", total: { $sum: "$amountPaise" } } },
    ]);

    let prevIncome = 0;
    let prevExpense = 0;
    prevAgg.forEach((r) => {
      if (r._id === "income") prevIncome = r.total;
      if (r._id === "expense") prevExpense = r.total;
    });

    // --- Head breakdown ---
    const headAgg = await Entry.aggregate([
      { $match: periodMatch },
      {
        $group: {
          _id: { type: "$type", head: "$head" },
          total: { $sum: "$amountPaise" },
        },
      },
      {
        $lookup: {
          from: "heads",
          localField: "_id.head",
          foreignField: "_id",
          as: "headInfo",
        },
      },
      { $unwind: { path: "$headInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          type: "$_id.type",
          name: { $ifNull: ["$headInfo.name", "Uncategorized"] },
          color: { $ifNull: ["$headInfo.color", "#94a3b8"] },
          emoji: { $ifNull: ["$headInfo.emoji", ""] },
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // --- 6-month trend ---
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const s = `${key}-01`;
      const e = `${key}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;

      const tAgg = await Entry.aggregate([
        {
          $match: {
            account: accountId,
            deletedAt: null,
            type: { $in: ["income", "expense"] },
            date: { $gte: s, $lte: e },
          },
        },
        { $group: { _id: "$type", total: { $sum: "$amountPaise" } } },
      ]);

      let inc = 0;
      let exp = 0;
      tAgg.forEach((r) => {
        if (r._id === "income") inc = r.total;
        if (r._id === "expense") exp = r.total;
      });
      trend.push({ month: key, income: inc, expense: exp, net: inc - exp });
    }

    // --- Loans ---
    let youWillGet = 0;
    let youOwe = 0;
    let pendingCount = 0;
    try {
      const loans = await Loan.find({
        account: accountId,
        status: "pending",
      }).lean();
      pendingCount = loans.length;
      loans.forEach((l) => {
        if (l.direction === "lent") youWillGet += l.amountPaise || 0;
        else youOwe += l.amountPaise || 0;
      });
    } catch (_) {
      // Loan model may not exist yet
    }

    res.json({
      period: { year: curYear, month: curMonth, isAllTime: !!isAllTime },
      allTime: {
        cashPaise: cashPaise || 0,
        onlinePaise: onlinePaise || 0,
        totalPaise: (cashPaise || 0) + (onlinePaise || 0),
      },
      monthTotals: {
        incomePaise: monthIncome || 0,
        expensePaise: monthExpense || 0,
        netPaise: (monthIncome || 0) - (monthExpense || 0),
      },
      prevTotals: {
        incomePaise: prevIncome || 0,
        expensePaise: prevExpense || 0,
      },
      incomeByHead: headAgg.filter((h) => h.type === "income"),
      expenseByHead: headAgg.filter((h) => h.type === "expense"),
      monthlyTrend: trend,
      loans: {
        youWillGetPaise: youWillGet,
        youOwePaise: youOwe,
        pendingCount,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
