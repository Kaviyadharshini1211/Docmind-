// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "No token provided" });
  }

  // Support both "Bearer <token>" and raw token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // user ID attached to every protected request
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};