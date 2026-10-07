const mongoose = require("mongoose");
const loanSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    person: { type: String, required: true, trim: true },
    direction: { type: String, enum: ["lent", "borrowed"], required: true },
    amountPaise: { type: Number, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    dueDate: { type: String, default: null },
    note: { type: String, default: "" },
    status: { type: String, enum: ["pending", "returned"], default: "pending" },
    settledEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entry",
      default: null,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Loan", loanSchema);
