const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * 1. CONFIGURE STORAGE FOR MULTER
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/images/products/';
        // Automatically create folder if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Creates a unique filename: timestamp + original extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * 2. GET PRODUCTS (With Search)
 */
router.get('/', async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const sql = 'SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?) ORDER BY id DESC';
        const [rows] = await db.query(sql, [`%${searchTerm}%`]);
        res.json(rows);
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

/**
 * 3. POST (Add Product with Image Upload)
 * Note: 'productImage' matches formData.append('productImage', ...) in main.js
 */
router.post('/', upload.single('productImage'), async (req, res) => {
    try {
        const { name, quantity, price, category } = req.body;
        
        // If file uploaded, use path. Otherwise use placeholder.
        const imageUrl = req.file ? `/images/products/${req.file.filename}` : '/images/placeholder.png';

        const sql = 'INSERT INTO products (name, quantity, price, category, image_url) VALUES (?, ?, ?, ?, ?)';
        await db.execute(sql, [name, quantity, price, category, imageUrl]);
        
        res.status(201).json({ success: true, message: "Product added successfully" });
    } catch (err) {
        console.error("POST Error:", err);
        res.status(500).json({ success: false, error: "Server Error" });
    }
});

/**
 * 4. PUT (Update Product with Optional Image Upload)
 */
router.put('/:id', upload.single('productImage'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, price, category } = req.body;
        
        // Start building the dynamic query
        let sql = 'UPDATE products SET name = ?, quantity = ?, price = ?, category = ?';
        let params = [name, quantity, price, category];

        // If a new image was uploaded, add it to the update list
        if (req.file) {
            sql += ', image_url = ?';
            params.push(`/images/products/${req.file.filename}`);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ success: true, message: 'Updated successfully' });
    } catch (err) {
        console.error("PUT Error:", err);
        res.status(500).json({ error: "Update failed" });
    }
});

/**
 * 5. DELETE PRODUCT
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.send('Product deleted successfully');
    } catch (err) {
        console.error("DELETE Error:", err);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

/**
 * 6. PATCH (Quick Restock + History Logging)
 */
router.patch('/restock/:id', async (req, res) => {
    const productId = req.params.id;
    const { increment, user } = req.body;

    if (!increment || isNaN(increment) || increment <= 0) {
        return res.status(400).json({ error: "Invalid increment value" });
    }

    try {
        const updateSql = 'UPDATE products SET quantity = quantity + ?, updated_at = NOW() WHERE id = ?';
        const historySql = 'INSERT INTO stock_history (product_id, user_name, change_amount, action_type) VALUES (?, ?, ?, "restock")';

        const [result] = await db.query(updateSql, [increment, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await db.query(historySql, [productId, user || 'Unknown User', increment]);
        res.send('Restock logged and updated successfully');
    } catch (err) {
        console.error("Restock Error:", err);
        res.status(500).json({ error: "Restock operation failed" });
    }
});

module.exports = router;