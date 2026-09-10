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
        const { name, category, quantity, price } = req.body;
        const uploadedFile = (req.files?.image && req.files.image[0]) || (req.files?.productImage && req.files.productImage[0]);
        const imageUrl = uploadedFile ? `/uploads/${uploadedFile.filename}` : null;

        const sql = 'INSERT INTO products (name, category, quantity, price, image_url) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [name, category, quantity || 0, price || 0, imageUrl]);
        
        res.status(201).json({ 
            success: true, 
            message: "Product added successfully", 
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
    const { name, category, quantity, price, adjustment, clerk_name } = req.body;

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

        const uploadedFile = (req.files?.image && req.files.image[0]) || (req.files?.productImage && req.files.productImage[0]);
        let newImageUrl = existing.image_url;
        if (uploadedFile) {
            newImageUrl = `/uploads/${uploadedFile.filename}`;
        }

        const updateSql = 'UPDATE products SET name = ?, category = ?, quantity = ?, price = ?, image_url = ? WHERE id = ?';
        await connection.query(updateSql, [newName, newCategory, newQuantity, newPrice, newImageUrl, productId]);

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
