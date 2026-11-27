const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../config/keys/public.pem'), 'utf8');

exports.verifyGatewayToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization Header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Strictly enforce RS256 asymmetric verification
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    req.tenantId = decoded.tenantId;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or tampered cryptographic signature' });
  }
};
