const mongoose = require('mongoose');
const AccountSchema = require('../models/AccountSchema');
const LedgerSchema = require('../models/LedgerSchema');

const connectionPool = new Map();

/**
 * Dynamically boots or reuses an isolated MongoDB connection per tenant
 */
const getTenantConnection = async (tenantId) => {
  if (connectionPool.has(tenantId)) {
    const conn = connectionPool.get(tenantId);
    if (conn.readyState === 1) return conn;
  }

  // Can map tenantId to completely separate cluster URIs via a secure vault/env
  const tenantUri = process.env[`MONGO_URI_${tenantId.toUpperCase()}`] 
    || `${process.env.BASE_MONGO_URI}/ledgerguard_${tenantId}?retryWrites=true&w=majority`;

  const connection = await mongoose.createConnection(tenantUri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  }).asPromise();

  // Register MVC Models strictly onto this isolated connection
  connection.model('Account', AccountSchema);
  connection.model('Ledger', LedgerSchema);

  connectionPool.set(tenantId, connection);
  return connection;
};

module.exports = { getTenantConnection };
