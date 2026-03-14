const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getBalance } = require("../controllers/walletController");

// GET /api/wallet/balance
router.get("/balance", protect, getBalance);

module.exports = router;
