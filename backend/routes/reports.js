const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Reports and Analytics Endpoints
router.get('/analytics', reportController.getAnalytics);
router.get('/sales', reportController.getSalesReport);

module.exports = router;
