// Middleware to ensure company-level data isolation
const ensureCompanyAccess = (req, res, next) => {
  if (!req.user || !req.user.company_id) {
    return res.status(401).json({ status: false, message: 'Authentication required' });
  }

  // Ensure all queries are scoped to the user's company
  req.company_id = req.user.company_id;
  next();
};

module.exports = { ensureCompanyAccess };

