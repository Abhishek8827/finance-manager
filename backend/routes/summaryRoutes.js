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

    const trendPeriods = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - 1 - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      trendPeriods.push({
        key,
        start: `${key}-01`,
        end: `${key}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`,
      });
    }

    const prevDate = new Date(curYear, curMonth - 2, 1);
    const pY = prevDate.getFullYear();
    const pM = prevDate.getMonth() + 1;
    const pStr = String(pM).padStart(2, "0");
    const pLast = new Date(pY, pM, 0).getDate();
    const prevStart = `${pY}-${pStr}-01`;
    const prevEnd = `${pY}-${pStr}-${String(pLast).padStart(2, "0")}`;

    const periodMatch = {
      account: accountId,
      deletedAt: null,
      type: { $in: ["income", "expense"] },
    };
    if (!isAllTime) {
      periodMatch.date = { $gte: monthStart, $lte: monthEnd };
    }

    const [allModeAgg, monthAgg, prevAgg, headAgg, trendAgg, loans] =
      await Promise.all([
        Entry.aggregate([
          { $match: { account: accountId, deletedAt: null } },
          {
            $group: {
              _id: { mode: "$mode", isOutgoing: "$isOutgoing" },
              total: { $sum: "$amountPaise" },
            },
          },
        ]),
        Entry.aggregate([
          { $match: periodMatch },
          { $group: { _id: "$type", total: { $sum: "$amountPaise" } } },
        ]),
        Entry.aggregate([
          {
            $match: {
              account: accountId,
              deletedAt: null,
              type: { $in: ["income", "expense"] },
              date: { $gte: prevStart, $lte: prevEnd },
            },
          },
          { $group: { _id: "$type", total: { $sum: "$amountPaise" } } },
        ]),
        Entry.aggregate([
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
        ]),
        Entry.aggregate([
          {
            $match: {
              account: accountId,
              deletedAt: null,
              type: { $in: ["income", "expense"] },
              date: {
                $gte: trendPeriods[0].start,
                $lte: trendPeriods[trendPeriods.length - 1].end,
              },
            },
          },
          {
            $group: {
              _id: {
                month: { $substrBytes: ["$date", 0, 7] },
                type: "$type",
              },
              total: { $sum: "$amountPaise" },
            },
          },
        ]),
        Loan.find({ account: accountId, status: "pending" })
          .select("direction amountPaise")
          .lean()
          .catch(() => []),
      ]);

    // --- All-time mode balances ---
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

    let monthIncome = 0;
    let monthExpense = 0;
    monthAgg.forEach((r) => {
      if (r._id === "income") monthIncome = r.total;
      if (r._id === "expense") monthExpense = r.total;
    });

    let prevIncome = 0;
    let prevExpense = 0;
    prevAgg.forEach((r) => {
      if (r._id === "income") prevIncome = r.total;
      if (r._id === "expense") prevExpense = r.total;
    });

    // --- 6-month trend ---
    const trendTotals = new Map();
    trendAgg.forEach(({ _id, total }) => {
      const totals = trendTotals.get(_id.month) || { income: 0, expense: 0 };
      totals[_id.type] = total;
      trendTotals.set(_id.month, totals);
    });
    const trend = trendPeriods.map(({ key }) => {
      const { income = 0, expense = 0 } = trendTotals.get(key) || {};
      return { month: key, income, expense, net: income - expense };
    });

    // --- Loans ---
    let youWillGet = 0;
    let youOwe = 0;
    const pendingCount = loans.length;
    loans.forEach((l) => {
      if (l.direction === "lent") youWillGet += l.amountPaise || 0;
      else youOwe += l.amountPaise || 0;
    });

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
