const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { sendNotification } = require("../utils/notificationService");

const DAILY_TRANSFER_LIMIT = 10000;
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 100000;

// ==================== ADD MONEY ====================
exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined || typeof amount !== "number") {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount < MIN_AMOUNT) {
      return res.status(400).json({ message: `Minimum amount is $${MIN_AMOUNT}` });
    }

    if (amount > MAX_AMOUNT) {
      return res.status(400).json({ message: `Maximum amount is $${MAX_AMOUNT}` });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: amount } },
      { new: true }
    );

    const transaction = await Transaction.create({
      sender: req.user._id,
      receiver: req.user._id,
      amount,
      status: "SUCCESS",
      transactionType: "ADD"
    });

    sendNotification("ADD_MONEY_SUCCESS", req.user._id, {
      amount,
      newBalance: user.balance,
      transactionId: transaction._id
    });

    res.status(200).json({
      message: "Money added successfully",
      balance: user.balance,
      transactionId: transaction._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== SEND MONEY ====================
exports.sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receiverEmail, amount } = req.body;

    // Validation
    if (!receiverEmail || typeof receiverEmail !== "string") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Receiver email is required" });
    }

    if (amount === undefined || typeof amount !== "number") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    if (amount < MIN_AMOUNT) {
      await session.abortTransaction();
      return res.status(400).json({ message: `Minimum amount is $${MIN_AMOUNT}` });
    }

    if (amount > MAX_AMOUNT) {
      await session.abortTransaction();
      return res.status(400).json({ message: `Maximum amount is $${MAX_AMOUNT}` });
    }

    // Check if sending to self
    if (req.user.email === receiverEmail) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot send money to yourself" });
    }

    // Find receiver
    const receiver = await User.findOne({ email: receiverEmail }).session(session);

    if (!receiver) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Receiver not found" });
    }

    // Check sender balance
    const sender = await User.findById(req.user._id).session(session);

    if (sender.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Check daily transfer limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransfers = await Transaction.aggregate([
      {
        $match: {
          sender: sender._id,
          transactionType: "SEND",
          status: "SUCCESS",
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]).session(session);

    const currentDailyUsage = todayTransfers[0]?.totalAmount || 0;

    if (currentDailyUsage + amount > DAILY_TRANSFER_LIMIT) {
      await session.abortTransaction();
      const remaining = DAILY_TRANSFER_LIMIT - currentDailyUsage;
      return res.status(400).json({
        message: `Daily transfer limit exceeded. Remaining today: $${remaining.toFixed(2)}`
      });
    }

    // Atomic update: deduct from sender, add to receiver
    await User.findByIdAndUpdate(
      sender._id,
      { $inc: { balance: -amount } },
      { session }
    );

    await User.findByIdAndUpdate(
      receiver._id,
      { $inc: { balance: amount } },
      { session }
    );

    // Create transactions for both sender and receiver
    const [senderTxn, receiverTxn] = await Transaction.create(
      [
        {
          sender: sender._id,
          receiver: receiver._id,
          amount,
          status: "SUCCESS",
          transactionType: "SEND"
        },
        {
          sender: sender._id,
          receiver: receiver._id,
          amount,
          status: "SUCCESS",
          transactionType: "RECEIVE"
        }
      ],
      { session }
    );

    await session.commitTransaction();

    // Send notifications
    sendNotification("SEND_SUCCESS", sender._id, {
      amount,
      receiverName: receiver.name,
      receiverEmail: receiver.email,
      transactionId: senderTxn._id
    });

    sendNotification("RECEIVE_SUCCESS", receiver._id, {
      amount,
      senderName: sender.name,
      senderEmail: sender.email,
      transactionId: receiverTxn._id
    });

    res.status(200).json({
      message: "Money sent successfully",
      transactionId: senderTxn._id,
      senderBalance: sender.balance - amount,
      receiverBalance: receiver.balance + amount
    });

  } catch (error) {
    await session.abortTransaction();

    console.error("Send money error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// ==================== GET BALANCE ====================
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "No token, authorization denied" });

    const user = await User.findById(userId).select("balance");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ balance: user.balance });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ==================== GET TRANSACTION HISTORY ====================
exports.getTransactionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name email")
    .populate("receiver", "name email");

    const total = await Transaction.countDocuments({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    });

    res.status(200).json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== GET DAILY TRANSACTION LIMIT STATUS ====================
exports.getDailyLimitStatus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransfers = await Transaction.aggregate([
      {
        $match: {
          sender: new mongoose.Types.ObjectId(req.user._id),
          transactionType: "SEND",
          status: "SUCCESS",
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const currentUsage = todayTransfers[0]?.totalAmount || 0;
    const remaining = DAILY_TRANSFER_LIMIT - currentUsage;

    res.status(200).json({
      dailyLimit: DAILY_TRANSFER_LIMIT,
      used: currentUsage,
      remaining: Math.max(0, remaining),
      resetTime: "00:00 UTC"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
