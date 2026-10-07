const Head = require("../models/Head");
const Entry = require("../models/Entry");

exports.getHeads = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) {
      filter.type = req.query.type;
    }
    const heads = await Head.find(filter).sort({ name: 1 });
    res.json(heads);
  } catch (error) {
    next(error);
  }
};

exports.createHead = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Head name is required" });
    }
    if (!type || !["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ error: "Valid type (income/expense) is required" });
    }

    const head = await Head.create({ name: name.trim(), type });
    res.status(201).json(head);
  } catch (error) {
    next(error);
  }
};

exports.deleteHead = async (req, res, next) => {
  try {
    const entryCount = await Entry.countDocuments({ head: req.params.id });
    if (entryCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: this head is used by ${entryCount} entries`,
      });
    }

    const head = await Head.findByIdAndDelete(req.params.id);
    if (!head) {
      return res.status(404).json({ error: "Head not found" });
    }

    res.json({ message: "Head deleted successfully" });
  } catch (error) {
    next(error);
  }
};
