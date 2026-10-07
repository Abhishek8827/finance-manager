const mongoose = require("mongoose");
const recurringSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: { type: String, enum: ["income", "expense"], required: true },
    amountPaise: { type: Number, required: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: "Head", required: true },
    mode: { type: String, enum: ["cash", "online"], required: true },
    frequency: { type: String, enum: ["monthly", "weekly"], required: true },
    dayOfMonth: { type: Number, default: null },
    startDate: { type: String, required: true },
    lastAddedOn: { type: String, default: null },
    note: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Recurring", recurringSchema);
