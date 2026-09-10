const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Schedule Endpoints
router.get('/', scheduleController.getAllSchedules);
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;