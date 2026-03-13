const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false
});

const sendMoneyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many send money requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.user._id.toString()
});

module.exports = { loginLimiter, sendMoneyLimiter };
