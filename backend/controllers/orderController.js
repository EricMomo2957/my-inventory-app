const db = require('../config/db');

// 1. GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
    try {
        const sql = `
            SELECT 
                o.id AS order_id,
                o.user_id,
                o.total_amount,
                o.status,
                o.order_date,
                o.guest_name,
                o.guest_contact,
                o.guest_address,
                u.full_name AS customer_name,
                oi.id AS item_id,
                oi.quantity AS order_qty,
                oi.price_at_time AS price,
                p.name AS product_name,
                p.category
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            ORDER BY o.order_date DESC, o.id DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("SQL Orders Error:", err.message);
        try {
            const [orders] = await db.query("SELECT * FROM orders ORDER BY id DESC");
            res.json(orders);
        } catch (fallbackErr) {
            res.status(500).json({ error: err.message });
        }
    }
};

// 2. GET USER ORDERS
exports.getUserOrders = async (req, res) => {
    const userId = req.params.userId;
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid User ID" });

    const sql = `
        SELECT 
            o.id, 
            o.total_amount, 
            o.status, 
            o.order_date,
            p.name AS product_name, 
            p.category, 
            p.price AS unit_price, 
            p.image_url,
            COALESCE(oi.quantity, 1) AS quantity
        FROM orders o 
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id OR o.product_id = p.id
        WHERE o.user_id = ? 
        ORDER BY o.order_date DESC, o.id DESC
    `;

    try {
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Order Fetch Error:", err);
        res.status(500).json({ error: "Database error: " + err.message });
    }
};

// 3. CREATE ORDER (Registered)
exports.createOrder = async (req, res) => {
    const { userId, user_id, items, product_id, quantity, price } = req.body;
    const finalUserId = userId || user_id || null;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        let orderItems = items;
        if (!orderItems && product_id) {
            orderItems = [{ id: product_id, productId: product_id, quantity: quantity || 1, price: price || 0 }];
        }

        if (!orderItems || orderItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: "No items provided for the order" });
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, 0, "completed")',
            [finalUserId]
        );
        const orderId = orderResult.insertId;
        let totalAmount = 0;

        for (const item of orderItems) {
            const pId = item.id || item.productId;
            const pQty = parseInt(item.quantity) || 1;
            const variantId = item.variant_id || item.variantId || null;
            const variantName = item.variant_name || null;

            const [prod] = await connection.query('SELECT price, quantity, name FROM products WHERE id = ?', [pId]);
            if (!prod[0] || prod[0].quantity < pQty) {
                const pName = prod[0]?.name || `ID ${pId}`;
                throw new Error(`Insufficient stock for product: ${pName}`);
            }

            // If variant specified, check and deduct variant stock
            if (variantId) {
                const [varRows] = await connection.query('SELECT quantity, variant_name FROM product_variants WHERE id = ? AND product_id = ?', [variantId, pId]);
                if (varRows.length > 0) {
                    await connection.query('UPDATE product_variants SET quantity = GREATEST(0, quantity - ?) WHERE id = ?', [pQty, variantId]);
                }
            }

            const itemPrice = item.price !== undefined ? parseFloat(item.price) : parseFloat(prod[0].price);
            totalAmount += itemPrice * pQty;

            await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [pQty, pId]);

            try {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, variant_id, variant_name) VALUES (?, ?, ?, ?, ?, ?)',
                    [orderId, pId, pQty, itemPrice, variantId, variantName]
                );
            } catch (e) {
                try {
                    await connection.query(
                        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                        [orderId, pId, pQty, itemPrice]
                    );
                } catch (fallbackErr) {
                    await connection.query('UPDATE orders SET product_id = ? WHERE id = ?', [pId, orderId]);
                }
            }

            // Log stock history for order dispatch
            try {
                const note = variantName ? `Order Dispatch (Variant: ${variantName})` : 'Order Dispatch / Sale';
                await connection.query(
                    'INSERT INTO stock_history (product_id, user_name, change_amount, action_type, reference_no, notes) VALUES (?, ?, ?, "sale", ?, ?)',
                    [pId, finalUserId ? `User #${finalUserId}` : 'POS / Staff', pQty, `ORD-${orderId}`, note]
                );
            } catch (histErr) {
                // Ignore if history log fails
            }
        }

        await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, orderId]);

        await connection.commit();
        res.status(201).json({ success: true, message: "Order placed successfully!", orderId: orderId });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Order Creation Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

// 4. CREATE GUEST ORDER
exports.createGuestOrder = async (req, res) => {
    const { customer, items, total } = req.body;
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [orderResult] = await connection.query(`
            INSERT INTO orders (user_id, total_amount, status, guest_name, guest_contact, guest_address) 
            VALUES (NULL, ?, 'pending', ?, ?, ?)
        `, [
            total || 0, 
            customer?.name || 'Guest Customer', 
            customer?.contact || '', 
            customer?.address || ''
        ]);

        const orderId = orderResult.insertId;

        if (items && Array.isArray(items)) {
            for (const item of items) {
                const pId = item.id || item.productId;
                const pQty = parseInt(item.quantity) || 1;
                const variantId = item.variant_id || item.variantId || null;
                const variantName = item.variant_name || null;

                // Deduct variant stock if applicable
                if (variantId) {
                    try {
                        await connection.query('UPDATE product_variants SET quantity = GREATEST(0, quantity - ?) WHERE id = ?', [pQty, variantId]);
                    } catch (vErr) {}
                }

                await connection.query(
                    'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                    [pQty, pId]
                );

                try {
                    await connection.query(
                        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time, variant_id, variant_name) VALUES (?, ?, ?, ?, ?, ?)',
                        [orderId, pId, pQty, item.price || 0, variantId, variantName]
                    );
                } catch (e) {
                    try {
                        await connection.query(
                            'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                            [orderId, pId, pQty, item.price || 0]
                        );
                    } catch (fErr) {
                        console.warn("Item insert fallback:", fErr.message);
                    }
                }
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: "Guest order placed successfully!", orderId });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Guest Order Error:", err);
        res.status(500).json({ success: false, error: "Failed to process guest order: " + err.message });
    } finally {
        if (connection) connection.release();
    }
};

// 5. UPDATE ORDER
exports.updateOrder = async (req, res) => {
    const { status, total_amount } = req.body;
    const orderId = req.params.id;
    try {
        let sql = "UPDATE orders SET ";
        const params = [];
        const updates = [];

        if (status) {
            updates.push("status = ?");
            params.push(status);
        }
        if (total_amount !== undefined) {
            updates.push("total_amount = ?");
            params.push(total_amount);
        }

        if (updates.length === 0) return res.json({ success: true });

        sql += updates.join(", ") + " WHERE id = ?";
        params.push(orderId);

        await db.query(sql, params);
        res.json({ success: true, message: "Order updated successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. DELETE ORDER
exports.deleteOrder = async (req, res) => {
    const orderId = req.params.id;
    try {
        const [result] = await db.query("DELETE FROM orders WHERE id = ?", [orderId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        res.json({ success: true, message: "Order deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not delete order." });
    }
};
