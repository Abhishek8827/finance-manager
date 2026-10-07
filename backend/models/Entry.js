const mongoose = require("mongoose");
const entrySchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },
    amountPaise: { type: Number, required: true, min: 1 }, // Changed to Paise
    date: { type: String, required: true }, // Changed to YYYY-MM-DD string
    head: { type: mongoose.Schema.Types.ObjectId, ref: "Head", default: null },
    summary: { type: String, default: "", maxlength: 300 },
    mode: { type: String, enum: ["cash", "online"], required: true },

    // Transfer Logic
    isOutgoing: { type: Boolean, default: false },
    transferId: { type: String, default: null },
    transferToAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    transferToMode: { type: String, enum: ["cash", "online"], default: null },

    // Relations
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      default: null,
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recurring",
      default: null,
    },

    deletedAt: { type: Date, default: null }, // Soft delete
  },
  { timestamps: true },
);

entrySchema.index({ account: 1, date: -1 });
entrySchema.index({ transferId: 1 });
module.exports = mongoose.model("Entry", entrySchema);
