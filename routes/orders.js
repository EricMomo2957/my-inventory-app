const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

/**
 * 1. GET ALL ORDERS
 * Updated to use 'order_date' to match your database schema
 */
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                oi.id AS item_id,
                o.id AS order_id,
                p.name AS product_name,
                p.category,
                oi.quantity AS order_qty,
                oi.price_at_time AS price,
                (oi.quantity * oi.price_at_time) AS total_item_price,
                o.order_date, 
                o.status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            ORDER BY o.order_date DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * 2. CREATE ORDER (POST)
 * Transactional logic for stock management
 */
router.post('/create', async (req, res) => {
    const { userId, items } = req.body; 
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create main order (order_date defaults to current timestamp in DB)
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, 0, "completed")',
            [userId || null]
        );
        const orderId = orderResult.insertId;
        let runningTotal = 0;

        for (const item of items) {
            // 2. Check stock
            const [prod] = await connection.execute(
                'SELECT price, quantity FROM products WHERE id = ?', 
                [item.productId]
            );

            if (!prod[0] || prod[0].quantity < item.quantity) {
                throw new Error(`Insufficient stock for Product ID: ${item.productId}`);
            }

            // 3. Subtract Stock
            await connection.execute(
                'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                [item.quantity, item.productId]
            );

            // 4. Record Item
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                [orderId, item.productId, item.quantity, prod[0].price]
            );

            runningTotal += (prod[0].price * item.quantity);
        }

        // 5. Finalize Total
        await connection.execute(
            'UPDATE orders SET total_amount = ? WHERE id = ?',
            [runningTotal, orderId]
        );

        await connection.commit();
        res.json({ success: true, orderId: orderId });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Order Creation Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;