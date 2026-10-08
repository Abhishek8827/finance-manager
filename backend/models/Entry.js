const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["income", "expense", "transfer", "loan"], // Added 'loan'
    },
    isOutgoing: {
      type: Boolean,
      required: true,
      default: false,
    },
    mode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: ["cash", "online"],
      default: "cash",
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    amountPaise: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Head",
      default: null,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [300, "Summary cannot exceed 300 characters"],
      default: "",
    },
    // Transfer fields
    transferId: {
      type: String,
      default: null,
      index: true,
    },
    transferToAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    transferToMode: {
      type: String,
      enum: ["cash", "online"],
      default: null,
    },
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
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

entrySchema.index({ account: 1, date: -1 });
entrySchema.index({ deletedAt: 1 });

module.exports = mongoose.model("Entry", entrySchema);
