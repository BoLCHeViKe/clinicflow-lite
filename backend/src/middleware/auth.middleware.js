exports.authMiddleware = async (req, res, next) => {
  req.user = { id: 1 };
  next();
};
