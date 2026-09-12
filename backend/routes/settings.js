const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // Up to 50MB SQL file
});

const settingsController = require('../controllers/systemSettingsController');

// 1. Get & Update Settings
router.get('/', settingsController.getSettings);
router.post('/', settingsController.updateSettings);

// 2. 1-Click Database Backup & Restore
router.get('/backup', settingsController.exportBackup);
router.post('/restore', upload.single('backupFile'), settingsController.restoreBackup);

// 3. Automated Low-Stock & Expiry Notification Digest
router.post('/send-digest', settingsController.sendLowStockDigest);

module.exports = router;
