const inFlightAiRequests = new Set();

module.exports = (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.sendStatus(401);
  }

  if (inFlightAiRequests.has(userId)) {
    return res.status(409).json({
      message: "AI request is already in progress. Please wait for it to finish.",
    });
  }

  inFlightAiRequests.add(userId);

  const release = () => {
    inFlightAiRequests.delete(userId);
  };

  res.once("finish", release);
  res.once("close", release);

  next();
};
