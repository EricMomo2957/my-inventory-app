const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');

router.get('/', poController.getAllPurchaseOrders);
router.get('/:id', poController.getPurchaseOrderById);
router.post('/', poController.createPurchaseOrder);
router.put('/:id/status', poController.updatePOStatus);
router.post('/:id/receive', poController.receivePurchaseOrder);

module.exports = router;
