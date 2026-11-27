const { getTenantConnection } = require('../config/dbPool');

exports.attachTenantDB = async (req, res, next) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Tenant context missing' });
    req.dbConnection = await getTenantConnection(req.tenantId);
    next();
  } catch (err) {
    return res.status(503).json({ error: 'Failed to provision isolated tenant database' });
  }
};
