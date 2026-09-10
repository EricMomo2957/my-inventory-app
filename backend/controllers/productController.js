const db = require('../config/db');

// 1. GET ALL PRODUCTS (Search & Filter)
exports.getAllProducts = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        let sql = 'SELECT * FROM products';
        const params = [];

        if (searchTerm.trim() !== '') {
            sql += ' WHERE LOWER(name) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?)';
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }
        sql += ' ORDER BY id DESC';

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("GET Products Error:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// 2. GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        const { name, category, quantity, price, cost_price, sku, batch_number, expiry_date, min_threshold } = req.body;
        const uploadedFile = (req.files?.image && req.files.image[0]) || (req.files?.productImage && req.files.productImage[0]);
        const imageUrl = uploadedFile ? `/uploads/${uploadedFile.filename}` : null;

        const cost = cost_price !== undefined && cost_price !== '' ? parseFloat(cost_price) : Math.round((parseFloat(price) || 0) * 0.65 * 100) / 100;
        const generatedSku = sku || `SKU-${(category || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        const generatedBatch = batch_number || `LOT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(10 + Math.random() * 90)}`;
        const expiry = expiry_date || null;
        const threshold = min_threshold !== undefined ? parseInt(min_threshold) : 5;

        const sql = `INSERT INTO products (name, category, quantity, price, cost_price, sku, batch_number, expiry_date, min_threshold, image_url) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [
            name, 
            category || 'General', 
            quantity || 0, 
            price || 0, 
            cost, 
            generatedSku, 
            generatedBatch, 
            expiry, 
            threshold, 
            imageUrl
        ]);

        // Also record initial batch if quantity > 0
        if (parseInt(quantity) > 0) {
            try {
                await db.query(`
                    INSERT INTO product_batches (product_id, batch_number, supplier, quantity_received, quantity_remaining, cost_price, expiry_date)
                    VALUES (?, ?, 'Initial Registration', ?, ?, ?, ?)
                `, [result.insertId, generatedBatch, quantity, quantity, cost, expiry]);
            } catch (bErr) {
                console.warn("Initial batch log skipped:", bErr.message);
            }
        }
        
        res.status(201).json({ 
            success: true, 
            message: "Product added successfully with Cost and Batch details", 
            id: result.insertId,
            imageUrl: imageUrl 
        });
    } catch (err) {
        console.error("POST Product Error:", err);
        res.status(500).json({ success: false, error: "Server Error: " + err.message });
    }
};

// 4. UPDATE PRODUCT (With image upload and audit logging)
exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, category, quantity, price, cost_price, sku, batch_number, expiry_date, min_threshold, adjustment, clerk_name } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [results] = await connection.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (results.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Product not found" });
        }
        const existing = results[0];
        const oldQuantity = existing.quantity;

        const newName = name !== undefined ? name : existing.name;
        const newCategory = category !== undefined ? category : existing.category;
        const newQuantity = quantity !== undefined ? parseInt(quantity) : existing.quantity;
        const newPrice = price !== undefined ? parseFloat(price) : existing.price;
        const newCost = cost_price !== undefined ? parseFloat(cost_price) : existing.cost_price;
        const newSku = sku !== undefined ? sku : existing.sku;
        const newBatch = batch_number !== undefined ? batch_number : existing.batch_number;
        const newExpiry = expiry_date !== undefined ? expiry_date : existing.expiry_date;
        const newThreshold = min_threshold !== undefined ? parseInt(min_threshold) : existing.min_threshold;

        const uploadedFile = (req.files?.image && req.files.image[0]) || (req.files?.productImage && req.files.productImage[0]);
        let newImageUrl = existing.image_url;
        if (uploadedFile) {
            newImageUrl = `/uploads/${uploadedFile.filename}`;
        }

        const updateSql = `UPDATE products 
                           SET name = ?, category = ?, quantity = ?, price = ?, cost_price = ?, sku = ?, batch_number = ?, expiry_date = ?, min_threshold = ?, image_url = ? 
                           WHERE id = ?`;
        await connection.query(updateSql, [
            newName, 
            newCategory, 
            newQuantity, 
            newPrice, 
            newCost, 
            newSku, 
            newBatch, 
            newExpiry, 
            newThreshold, 
            newImageUrl, 
            productId
        ]);

        // Audit Logging
        if (adjustment || newQuantity !== oldQuantity) {
            const adj = adjustment || (newQuantity - oldQuantity);
            const clerk = clerk_name || 'Admin / Staff';
            const actionType = adj >= 0 ? 'restock' : 'sale';

            try {
                await connection.query(
                    'INSERT INTO stock_history (product_id, user_name, change_amount, action_type) VALUES (?, ?, ?, ?)',
                    [productId, clerk, Math.abs(adj), actionType]
                );
            } catch (histErr) {
                try {
                    await connection.query(
                        'INSERT INTO stock_logs (product_id, product_name, clerk_name, adjustment, old_quantity, new_quantity) VALUES (?, ?, ?, ?, ?, ?)',
                        [productId, newName, clerk, adj, oldQuantity, newQuantity]
                    );
                } catch (logErr) {
                    console.warn("Audit logging warning:", logErr.message);
                }
            }
        }

        await connection.commit();
        res.json({ success: true, message: "Product updated successfully" });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("PUT Product Error:", err);
        res.status(500).json({ error: "Product update failed: " + err.message });
    } finally {
        if (connection) connection.release();
    }
};

// 5. DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        console.error("DELETE Error:", err);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

// 6. RESTOCK PRODUCT
exports.restockProduct = async (req, res) => {
    const productId = req.params.id;
    const { increment, user } = req.body;

    if (!increment || isNaN(increment) || increment <= 0) {
        return res.status(400).json({ error: "Invalid increment value" });
    }

    try {
        const updateSql = 'UPDATE products SET quantity = quantity + ? WHERE id = ?';
        const [result] = await db.query(updateSql, [increment, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        try {
            await db.query(
                'INSERT INTO stock_history (product_id, user_name, change_amount, action_type) VALUES (?, ?, ?, "restock")',
                [productId, user || 'Staff', increment]
            );
        } catch (e) {
            console.warn("History log skipped:", e.message);
        }

        res.json({ success: true, message: 'Restock logged and updated successfully' });
    } catch (err) {
        console.error("Restock Error:", err);
        res.status(500).json({ error: "Restock operation failed" });
    }
};

// 7. BATCH INBOUND STOCK RECEIVING (Supplier Delivery)
exports.batchStockIn = async (req, res) => {
    const { items, supplier, reference_no, clerk_name, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "No items provided for inbound receiving" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const clerk = clerk_name || 'Warehouse Clerk';
        const refNo = reference_no || `REC-${Date.now()}`;
        const sup = supplier || 'General Supplier';

        for (const item of items) {
            const qty = parseInt(item.quantity, 10);
            if (isNaN(qty) || qty <= 0) continue;

            const batchNo = item.batch_number || `LOT-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(10 + Math.random() * 90)}`;
            const expiry = item.expiry_date || null;
            const cost = item.cost_price ? parseFloat(item.cost_price) : null;

            // Update product quantity, and optionally update batch / expiry / cost
            let updateSql = 'UPDATE products SET quantity = quantity + ?';
            const params = [qty];

            if (batchNo) {
                updateSql += ', batch_number = ?';
                params.push(batchNo);
            }
            if (expiry) {
                updateSql += ', expiry_date = ?';
                params.push(expiry);
            }
            if (cost) {
                updateSql += ', cost_price = ?';
                params.push(cost);
            }

            updateSql += ' WHERE id = ?';
            params.push(item.id);

            await connection.query(updateSql, params);

            // Insert into product_batches table for FIFO tracking
            try {
                await connection.query(`
                    INSERT INTO product_batches (product_id, batch_number, supplier, quantity_received, quantity_remaining, cost_price, expiry_date)
                    VALUES (?, ?, ?, ?, ?, COALESCE(?, 0), ?)
                `, [item.id, batchNo, sup, qty, qty, cost, expiry]);
            } catch (bErr) {
                console.warn("Batch record skipped:", bErr.message);
            }

            const auditNotes = `Supplier: ${sup}. Batch: ${batchNo}. ${expiry ? `Expiry: ${expiry}. ` : ''}${notes ? notes : ''}`.trim();
            await connection.query(
                'INSERT INTO stock_history (product_id, user_name, change_amount, action_type, reference_no, notes) VALUES (?, ?, ?, "stock_in", ?, ?)',
                [item.id, clerk, qty, refNo, auditNotes]
            );
        }

        await connection.commit();
        res.json({ 
            success: true, 
            message: `Successfully received and stocked ${items.length} items from ${sup}.`,
            reference_no: refNo
        });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Batch Stock In Error:", err);
        res.status(500).json({ success: false, message: "Inbound receiving failed: " + err.message });
    } finally {
        if (connection) connection.release();
    }
};

// 8. BATCH CYCLE COUNT RECONCILIATION
exports.batchReconciliation = async (req, res) => {
    const { items, clerk_name, reference_no, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "No reconciliation items provided" });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const clerk = clerk_name || 'Inventory Auditor';
        const refNo = reference_no || `AUDIT-${Date.now()}`;

        for (const item of items) {
            const physicalCount = parseInt(item.physical_count, 10);
            const recordedCount = parseInt(item.recorded_count, 10);
            const variance = physicalCount - recordedCount;
            const reason = item.reason || 'Cycle Count Audit Adjustment';

            if (isNaN(physicalCount)) continue;

            // Set the exact physical count as the new quantity
            await connection.query(
                'UPDATE products SET quantity = ? WHERE id = ?',
                [physicalCount, item.id]
            );

            // Log the adjustment in stock_history
            const auditNotes = `Variance: ${variance >= 0 ? '+' : ''}${variance}. Reason: ${reason}. ${notes || ''}`.trim();
            await connection.query(
                'INSERT INTO stock_history (product_id, user_name, change_amount, action_type, reference_no, notes) VALUES (?, ?, ?, "reconciliation", ?, ?)',
                [item.id, clerk, variance, refNo, auditNotes]
            );
        }

        await connection.commit();
        res.json({ 
            success: true, 
            message: `Successfully reconciled ${items.length} inventory items.`,
            reference_no: refNo
        });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Batch Reconciliation Error:", err);
        res.status(500).json({ success: false, message: "Reconciliation failed: " + err.message });
    } finally {
        if (connection) connection.release();
    }
};

