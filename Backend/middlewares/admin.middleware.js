// manager has all admin privileges plus extra
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }

  if (!["admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }

  next();
};

export const requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }

  if (req.user.role !== "manager") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Manager privileges required."
    });
  }

  next();
};
