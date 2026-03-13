const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { sendMoneyLimiter } = require("../middleware/rateLimitMiddleware");
const {
  addMoney,
  sendMoney,
  getBalance,
  getTransactionHistory,
  getDailyLimitStatus
} = require("../controllers/walletController");

router.post("/wallet/add", protect, addMoney);
router.post("/wallet/send", protect, sendMoneyLimiter, sendMoney);
router.get("/wallet/balance", protect, getBalance);
router.get("/wallet/history", protect, getTransactionHistory);
router.get("/wallet/limit-status", protect, getDailyLimitStatus);

module.exports = router;
