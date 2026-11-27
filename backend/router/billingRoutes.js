// backend/routes/billingRoutes.js
const router = require('express').Router();
const { verifyGatewayToken } = require('../middlewares/authGateway');
const { attachTenantDB } = require('../middlewares/tenantResolver');
const { acquireIdempotencyLock } = require('../middlewares/idempotency');
const billingController = require('../controllers/billingController');

router.use(verifyGatewayToken, attachTenantDB);

router.get('/ledger', billingController.getLedgerAnalytics);
router.post('/charge', acquireIdempotencyLock, billingController.processCharge);

module.exports = router;
