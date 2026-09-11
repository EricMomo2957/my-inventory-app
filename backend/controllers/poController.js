const db = require('../config/db');

// 1. GET ALL PURCHASE ORDERS
exports.getAllPurchaseOrders = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM purchase_orders ORDER BY id DESC');
        
        // Fetch items for each PO
        for (const order of orders) {
            const [items] = await db.query('SELECT * FROM po_items WHERE po_id = ?', [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (err) {
        console.error("GET POs Error:", err);
        res.status(500).json({ error: "Failed to fetch POs: " + err.message });
    }
};

// 2. GET SINGLE PURCHASE ORDER
exports.getPurchaseOrderById = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
        if (orders.length === 0) return res.status(404).json({ error: "PO not found" });
        
        const [items] = await db.query('SELECT * FROM po_items WHERE po_id = ?', [req.params.id]);
        orders[0].items = items;
        res.json(orders[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. CREATE PURCHASE ORDER
exports.createPurchaseOrder = async (req, res) => {
    const { supplier_id, supplier_name, items, expected_date, notes, created_by } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required in the PO" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        let totalAmount = 0;
        items.forEach(item => {
            const qty = parseInt(item.quantity_ordered || item.quantity, 10) || 1;
            const cost = parseFloat(item.unit_cost || item.cost_price) || 0;
            totalAmount += (qty * cost);
        });

        const [poResult] = await connection.query(`
            INSERT INTO purchase_orders (po_number, supplier_id, supplier_name, total_amount, status, expected_date, notes, created_by)
            VALUES (?, ?, ?, ?, 'ordered', ?, ?, ?)
        `, [poNumber, supplier_id || null, supplier_name || 'General Supplier', totalAmount, expected_date || null, notes || '', created_by || 'Administrator']);

        const poId = poResult.insertId;

        for (const item of items) {
            const qty = parseInt(item.quantity_ordered || item.quantity, 10) || 1;
            const cost = parseFloat(item.unit_cost || item.cost_price) || 0;
            const total = qty * cost;

            await connection.query(`
                INSERT INTO po_items (po_id, product_id, product_name, quantity_ordered, unit_cost, total_cost)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [poId, item.product_id || item.id || null, item.product_name || item.name, qty, cost, total]);
        }

        await connection.commit();
        res.status(201).json({ 
            success: true, 
            message: `Purchase Order ${poNumber} created successfully`,
            po_id: poId,
            po_number: poNumber
        });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Create PO Error:", err);
        res.status(500).json({ error: "Failed to create PO: " + err.message });
    } finally {
        if (connection) connection.release();
    }
};

// 4. UPDATE PO STATUS (e.g. 'received', 'cancelled', 'ordered')
exports.updatePOStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: `PO status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. RECEIVE FULL PURCHASE ORDER (Direct Inbound Receiving Integration)
exports.receivePurchaseOrder = async (req, res) => {
    const poId = req.params.id;
    const { clerk_name } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [pos] = await connection.query('SELECT * FROM purchase_orders WHERE id = ?', [poId]);
        if (pos.length === 0) {
            return res.status(404).json({ error: "Purchase Order not found" });
        }

        const po = pos[0];
        const [items] = await connection.query('SELECT * FROM po_items WHERE po_id = ?', [poId]);

        const clerk = clerk_name || 'Warehouse Clerk';

        for (const item of items) {
            if (item.product_id) {
                // Update product quantity
                await connection.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [item.quantity_ordered, item.product_id]);
                
                // Log in stock history
                await connection.query(`
                    INSERT INTO stock_history (product_id, user_name, change_amount, action_type, reference_no, notes)
                    VALUES (?, ?, ?, 'stock_in', ?, ?)
                `, [item.product_id, clerk, item.quantity_ordered, po.po_number, `Received via Purchase Order ${po.po_number}`]);
            }
        }

        // Mark PO as received
        await connection.query("UPDATE purchase_orders SET status = 'received' WHERE id = ?", [poId]);

        await connection.commit();
        res.json({ success: true, message: `PO ${po.po_number} stock received and catalog quantities updated successfully.` });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Receive PO Error:", err);
        res.status(500).json({ error: "Failed to receive PO: " + err.message });
    } finally {
        if (connection) connection.release();
    }
};
