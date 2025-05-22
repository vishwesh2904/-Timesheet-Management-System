// Middleware to check user role
module.exports = function(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Access denied. Insufficient role.' });
    }
    next();
  };
};
