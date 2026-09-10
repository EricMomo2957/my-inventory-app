const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order Endpoints
router.get('/', orderController.getAllOrders);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:userId', orderController.getUserOrders);
router.post('/', orderController.createOrder);
router.post('/create', orderController.createOrder);
router.post('/guest-orders', orderController.createGuestOrder);
router.post('/guest', orderController.createGuestOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;