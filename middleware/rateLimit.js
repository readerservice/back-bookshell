const { default: rateLimit } = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40, 
  message: {
    message: "Too many login attempts. Try later.",
  },
})

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    message: "Too many reset requests. Try later.",
  },
});

const aiLimiterByUser = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  keyGenerator: (req) => req.user?.id,
})

module.exports = {
  authLimiter, loginLimiter, passwordResetLimiter, aiLimiterByUser
}