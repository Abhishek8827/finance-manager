const Account = require("../models/Account");
const Entry = require("../models/Entry");

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find().sort({ createdAt: 1 });
    res.json(accounts);
  } catch (error) {
    next(error);
  }
};

exports.createAccount = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Account name is required" });
    }
    const account = await Account.create({ name: name.trim() });
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Account name is required" });
    }

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true },
    );

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const entryCount = await Entry.countDocuments({ account: req.params.id });
    if (entryCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: this account has ${entryCount} entries. Delete them first.`,
      });
    }

    const totalAccounts = await Account.countDocuments();
    if (totalAccounts <= 1) {
      return res.status(400).json({ error: "Cannot delete the last account" });
    }

    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};
