const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 1000,
    min: 0
  },
  dailyTransferUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  lastTransferReset: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);