const mongoose = require("mongoose");
const headSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, enum: ["income", "expense"], required: true },
    color: { type: String, default: "#6366f1" },
    emoji: { type: String, default: "" },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Head", headSchema);
