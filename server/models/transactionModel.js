const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED", "PENDING"],
    default: "PENDING"
  },
  failureReason: {
    type: String,
    default: null
  },
  transactionType: {
    type: String,
    enum: ["SEND", "RECEIVE", "ADD"],
    required: true
  }
}, { timestamps: true });

transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
