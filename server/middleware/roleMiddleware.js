// server/middleware/roleMiddleware.js
module.exports = function authorizeRoles(...allowedRoles) {
  return function roleHandler(req, res, next) {
    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Không có quyền thực hiện thao tác này!" });
    }
    next();
  };
};
