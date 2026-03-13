const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["add", "send", "receive"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Transaction", transactionSchema);
