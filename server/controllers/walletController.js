const User = require("../models/User");
const Transaction = require("../models/Transaction");
const QRCode = require('qrcode'); // Import qrcode

// GET BALANCE
const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error("GET BALANCE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ADD MONEY
const addMoney = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.balance += amount;
    await user.save();

    // Record the deposit transaction (using receiver as self)
    await Transaction.create({
      receiver: user._id, 
      type: 'add',
      amount
    });

    res.status(200).json({
      message: "Money added successfully",
      balance: user.balance
    });

  } catch (error) {
    console.error("ADD MONEY ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// SEND MONEY (Supports Email or Phone)
const sendMoney = async (req, res) => {
  try {
    // We now accept 'recipient' which could be an email or phone number
    let { recipient, amount } = req.body;
    let recipientEmail = req.body.recipientEmail; // Fallback for backward compatibility
    
    // Combine the values if necessary based on old API vs new API usage
    const target = recipient || recipientEmail; 
    const transferAmount = Number(amount);

    if (!target || !transferAmount || transferAmount <= 0 || isNaN(transferAmount)) {
      return res.status(400).json({ message: "Invalid recipient or amount" });
    }

    let targetCleaned = target.trim().toLowerCase();
    
    // Clean markdown mailto if it exists
    if (targetCleaned.includes('mailto:')) {
      const match = targetCleaned.match(/mailto:([^)]+)/);
      if (match) targetCleaned = match[1];
    }

    const sender = await User.findById(req.user._id);
    
    // Find recipient by either email OR phone number exactly
    const recipientUser = await User.findOne({ 
      $or: [
        { email: new RegExp('^' + targetCleaned + '$', 'i') },
        { phone: targetCleaned }
      ]
    });

    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    
    if (sender._id.toString() === recipientUser._id.toString()) {
      return res.status(400).json({ message: "Cannot send money to yourself" });
    }

    if (sender.balance < transferAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Process the money transfer
    sender.balance -= transferAmount;
    recipientUser.balance += transferAmount;

    await sender.save();
    await recipientUser.save();

    // Record a single unified transaction or separate, but schema shows sender/receiver natively
    // We'll record two perspectives for easy querying later, or one unified depending on schema
    // The Schema has both sender and receiver
    
    // Sender perspective ('send')
    await Transaction.create({
      sender: sender._id,
      receiver: recipientUser._id,
      type: 'send',
      amount: transferAmount,
    });

    // Receiver perspective ('receive')
    await Transaction.create({
      sender: sender._id,
      receiver: recipientUser._id,
      type: 'receive',
      amount: transferAmount,
    });

    res.status(200).json({
      message: "Money sent successfully",
      balance: sender.balance
    });

  } catch (error) {
    console.error("SEND MONEY ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// TRANSACTION HISTORY
const getTransactionHistory = async (req, res) => {
  try {
    // In our new schema, transactions could be associated with user._id either as 'sender' or 'receiver'
    const userTransactions = await Transaction.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email phone')
    .populate('receiver', 'name email phone')
    .sort({ createdAt: -1 });
    
    res.status(200).json({ transactions: userTransactions });
  } catch (error) {
    console.error("TRANSACTION HISTORY ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GENERATE QR CODE
const generateQR = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Define the payment URL or string that the QR will encode
    // In a production app this would ideally point to a deep link or the hosted web URL
    const paymentTarget = user.phone || user.email;
    const paymentUrl = `http://localhost:5174/send-money?to=${encodeURIComponent(paymentTarget)}`;
    
    // Generate the QR code as a Data URL (base64 image)
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl);
    
    res.status(200).json({ 
      qrCode: qrCodeDataUrl,
      paymentUrl: paymentUrl
    });
    
  } catch (error) {
    console.error("GENERATE QR ERROR:", error);
    res.status(500).json({ message: "Server error generating QR", error: error.message });
  }
};

module.exports = {
  getWalletBalance,
  addMoney,
  sendMoney,
  getTransactionHistory,
  generateQR
};