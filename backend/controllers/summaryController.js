const Entry = require("../models/Entry");
const mongoose = require("mongoose");

exports.getSummary = async (req, res, next) => {
  try {
    const { account, month, year } = req.query;

    if (!account) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    const accountId = new mongoose.Types.ObjectId(account);

    // Build Date Filter
    let dateFilter = {};
    if (month && year && month !== "all" && year !== "all") {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(
        parseInt(year),
        parseInt(month),
        0,
        23,
        59,
        59,
        999,
      );
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    } else if (year && year !== "all" && month === "all") {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }

    // 1. Overall Income vs Expense Totals
    const totalsAgg = await Entry.aggregate([
      {
        $match: {
          account: accountId,
          type: { $in: ["income", "expense"] },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totals = { income: 0, expense: 0 };
    totalsAgg.forEach((t) => {
      totals[t._id] = t.total;
    });
    totals.balance = totals.income - totals.expense;

    // 2. Mode Balance (Cash vs Online) - ALL TIME
    // Rule: isOutgoing=false adds to mode balance; isOutgoing=true subtracts from mode balance.
    const allEntries = await Entry.find({ account: accountId }).lean();
    const modeBalance = { cash: 0, online: 0 };

    allEntries.forEach((entry) => {
      const mode = entry.mode || "cash";
      const isOutgoing =
        entry.isOutgoing !== undefined
          ? entry.isOutgoing
          : entry.type === "expense";

      if (isOutgoing) {
        modeBalance[mode] = (modeBalance[mode] || 0) - entry.amount;
      } else {
        modeBalance[mode] = (modeBalance[mode] || 0) + entry.amount;
      }
    });

    // 3. Category Breakdown
    const headWise = await Entry.aggregate([
      {
        $match: {
          account: accountId,
          type: { $in: ["income", "expense"] },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: { type: "$type", head: "$head" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
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
      { $unwind: "$headInfo" },
      {
        $project: {
          type: "$_id.type",
          headId: "$_id.head",
          headName: "$headInfo.name",
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const incomeByHead = headWise.filter((h) => h.type === "income");
    const expenseByHead = headWise.filter((h) => h.type === "expense");

    // 4. Monthly Trend
    const trendMatch = {
      account: accountId,
      type: { $in: ["income", "expense"] },
    };
    if (year && year !== "all") {
      trendMatch.date = {
        $gte: new Date(parseInt(year), 0, 1),
        $lte: new Date(parseInt(year), 11, 31, 23, 59, 59, 999),
      };
    } else {
      const now = new Date();
      trendMatch.date = {
        $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
        $lte: now,
      };
    }

    const monthlyTrend = await Entry.aggregate([
      { $match: trendMatch },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const trendMap = {};
    monthlyTrend.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      if (!trendMap[key]) {
        trendMap[key] = { month: key, income: 0, expense: 0 };
      }
      trendMap[key][item._id.type] = item.total;
    });

    const trend = Object.values(trendMap).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    res.json({
      totals,
      modeBalance,
      incomeByHead,
      expenseByHead,
      monthlyTrend: trend,
    });
  } catch (error) {
    next(error);
  }
};
