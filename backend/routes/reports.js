const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Reports and Analytics Endpoints
router.get('/analytics', reportController.getAnalytics);
router.get('/sales', reportController.getSalesReport);
router.get('/cogs', reportController.getCOGSReport);
router.get('/dead-stock', reportController.getDeadStockReport);
router.get('/procurement-spend', reportController.getProcurementSpendReport);

module.exports = router;
