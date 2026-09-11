const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Routes
router.get('/reorder-recommendations', analyticsController.getReorderRecommendations);
router.get('/abc-analysis', analyticsController.getABCAnalysis);

module.exports = router;
