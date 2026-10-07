const Entry = require("../models/Entry");
const mongoose = require("mongoose");
const crypto = require("crypto");

exports.getEntries = async (req, res, next) => {
  try {
    const {
      account,
      type,
      head,
      mode,
      from,
      to,
      search,
      page = 1,
      limit = 100,
    } = req.query;

    if (!account) {
      return res.status(400).json({ error: "Account ID is required" });
    }

    const filter = { account: new mongoose.Types.ObjectId(account) };

    if (type) filter.type = type;
    if (head) filter.head = new mongoose.Types.ObjectId(head);
    if (mode) filter.mode = mode;

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.date.$lte = toDate;
      }
    }

    if (search) {
      filter.summary = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Entry.countDocuments(filter);

    const entries = await Entry.find(filter)
      .populate("head", "name type")
      .populate("account", "name")
      .populate("transferToAccount", "name")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      entries,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

exports.createEntry = async (req, res, next) => {
  try {
    const { account, type, mode, date, amount, head, summary } = req.body;

    if (!account) return res.status(400).json({ error: "Account is required" });
    if (!type || !["income", "expense"].includes(type))
      return res.status(400).json({ error: "Valid type is required" });
    if (!mode)
      return res.status(400).json({ error: "Payment mode is required" });
    if (!date) return res.status(400).json({ error: "Date is required" });
    if (!amount || parseFloat(amount) <= 0)
      return res.status(400).json({ error: "Amount must be greater than 0" });

    const entry = await Entry.create({
      account,
      type,
      mode,
      date: new Date(date),
      amount: parseFloat(amount),
      head,
      summary: summary || "",
      isOutgoing: type === "expense",
    });

    const populated = await Entry.findById(entry._id)
      .populate("head", "name type")
      .populate("account", "name");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const { fromAccount, fromMode, toAccount, toMode, date, amount, summary } =
      req.body;

    if (!fromAccount || !fromMode || !toAccount || !toMode || !date) {
      return res
        .status(400)
        .json({ error: "All transfer fields are required" });
    }
    if (String(fromAccount) === String(toAccount) && fromMode === toMode) {
      return res
        .status(400)
        .json({ error: "Source and destination are the same" });
    }

    const transferGroupId = crypto.randomBytes(12).toString("hex");
    const amt = parseFloat(amount);
    const transferDate = new Date(date);

    const outgoing = await Entry.create({
      account: fromAccount,
      type: "transfer",
      isOutgoing: true,
      mode: fromMode,
      date: transferDate,
      amount: amt,
      summary: summary || "",
      transferGroupId,
      transferToAccount: toAccount,
      transferToMode: toMode,
    });

    const incoming = await Entry.create({
      account: toAccount,
      type: "transfer",
      isOutgoing: false,
      mode: toMode,
      date: transferDate,
      amount: amt,
      summary: summary || "",
      transferGroupId,
      transferToAccount: fromAccount,
      transferToMode: fromMode,
    });

    res.status(201).json({ outgoing, incoming });
  } catch (error) {
    next(error);
  }
};

exports.updateEntry = async (req, res, next) => {
  try {
    const existing = await Entry.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Entry not found" });

    if (existing.type === "transfer") {
      const {
        fromAccount,
        fromMode,
        toAccount,
        toMode,
        date,
        amount,
        summary,
      } = req.body;

      if (fromAccount && toAccount) {
        // Delete old transfer legs entirely
        await Entry.deleteMany({ transferGroupId: existing.transferGroupId });

        // Recreate with updated data
        const transferGroupId = existing.transferGroupId;
        const amt = parseFloat(amount);
        const transferDate = new Date(date);

        await Entry.create([
          {
            account: fromAccount,
            type: "transfer",
            isOutgoing: true,
            mode: fromMode,
            date: transferDate,
            amount: amt,
            summary: summary || "",
            transferGroupId,
            transferToAccount: toAccount,
            transferToMode: toMode,
          },
          {
            account: toAccount,
            type: "transfer",
            isOutgoing: false,
            mode: toMode,
            date: transferDate,
            amount: amt,
            summary: summary || "",
            transferGroupId,
            transferToAccount: fromAccount,
            transferToMode: fromMode,
          },
        ]);
        return res.json({ message: "Transfer updated successfully" });
      }
      return res.status(400).json({ error: "Missing transfer details" });
    }

    // Normal Income/Expense Update
    const { type, mode, date, amount, head, summary } = req.body;
    const updateData = {};
    if (type) {
      updateData.type = type;
      updateData.isOutgoing = type === "expense";
    }
    if (mode) updateData.mode = mode;
    if (date) updateData.date = new Date(date);
    if (amount) updateData.amount = parseFloat(amount);
    if (head) updateData.head = head;
    if (summary !== undefined) updateData.summary = summary;

    const entry = await Entry.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("head", "name type")
      .populate("account", "name");

    res.json(entry);
  } catch (error) {
    next(error);
  }
};

exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (entry.type === "transfer" && entry.transferGroupId) {
      await Entry.deleteMany({ transferGroupId: entry.transferGroupId });
      return res.json({ message: "Transfer deleted successfully" });
    }

    await Entry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    next(error);
  }
};
