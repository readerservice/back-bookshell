const LOCK_TTL_MS = 2 * 60 * 1000;
const inFlightAiRequests = new Map();

module.exports = (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.sendStatus(401);
  }

  const existing = inFlightAiRequests.get(userId);
  if (existing && existing.expiresAt > Date.now()) {
    return res.status(409).json({
      message: "AI request is already in progress. Please wait for it to finish.",
    });
  }

  if (existing) {
    clearTimeout(existing.timeout);
    inFlightAiRequests.delete(userId);
  }

  const release = (timeout) => {
    const current = inFlightAiRequests.get(userId);
    if (!current || current.timeout !== timeout) return;

    clearTimeout(timeout);
    inFlightAiRequests.delete(userId);
  };

  const timeout = setTimeout(() => release(timeout), LOCK_TTL_MS);
  inFlightAiRequests.set(userId, {
    expiresAt: Date.now() + LOCK_TTL_MS,
    timeout,
  });

  res.once("finish", () => release(timeout));
  res.once("close", () => release(timeout));

  next();
};
