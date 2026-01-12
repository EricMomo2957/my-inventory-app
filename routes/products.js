const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// 1. Configure storage for Multer
const storage = multer.diskStorage({
    destination: './public/images/', // Ensure this folder exists
    filename: (req, file, cb) => {
        // Creates a unique filename: 17123456789.png
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * 2. POST (Add Product with Image Upload)
 * This handles the FormData from your addModal.html
 */
router.post('/add', upload.single('productImage'), async (req, res) => {
    const { name, qty, price, category } = req.body;
    
    // Check if a file was uploaded, otherwise use placeholder
    const imageUrl = req.file ? `/images/${req.file.filename}` : '/images/placeholder.png';

    try {
        const sql = 'INSERT INTO products (name, quantity, price, category, image_url) VALUES (?, ?, ?, ?, ?)';
        await db.execute(sql, [name, qty, price, category, imageUrl]);
        res.json({ success: true, message: "Product added successfully" });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * 3. GET Products (with Search support)
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
 * 4. PUT (Update Product)
 * Note: If you want to update images too, you would add upload.single here as well
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, price, category } = req.body;
        const sql = 'UPDATE products SET name = ?, quantity = ?, price = ?, category = ? WHERE id = ?';
        const [result] = await db.query(sql, [name, quantity, price, category, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).send('Product not found');
        }
        res.send('Product updated successfully');
    } catch (err) {
        console.error("PUT Error:", err);
        res.status(500).json({ error: "Failed to update product" });
    }
});

/**
 * 5. DELETE Product
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