const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getWalletBalance, addMoney, sendMoney, getTransactionHistory, generateQR } = require("../controllers/walletController");

router.get("/balance", protect, getWalletBalance);
router.post("/add-money", protect, addMoney);
router.post("/send-money", protect, sendMoney);
router.get("/transactions", protect, getTransactionHistory);
router.get("/qr", protect, generateQR);

module.exports = router;