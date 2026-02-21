const SOFT_DAILY_LIMIT = 300;

const users = require('../models/usersModel')

module.exports = async (req, res, next) => {
  const user = await users.findById(req.user.id);

  const today = new Date().toDateString();

  if (user.aiDailyDate?.toDateString() !== today) {
    user.aiDailyCount = 0;
    user.aiDailyDate = new Date();
  }

  if (user.aiDailyCount >= SOFT_DAILY_LIMIT) {
    return res.status(429).json({
      message: "Daily AI limit reached. Try again tomorrow.",
    });
  }

  user.aiDailyCount += 1;
  await user.save();

  next();
};