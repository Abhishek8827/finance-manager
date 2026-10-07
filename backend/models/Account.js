const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    color: { type: String, default: "#6366f1" },
    pinHash: { type: String, default: null }, // for Auth
    pinFailedCount: { type: Number, default: 0 },
    pinLockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Account", accountSchema);
