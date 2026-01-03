const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * 1. GET Products (with Search support)
 */
router.get('/', async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        // Using LOWER() ensures "T-shirt" matches "t-shirt" regardless of DB settings
        const sql = 'SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?) ORDER BY id DESC';
        
        const [rows] = await db.query(sql, [`%${searchTerm}%`]);
        res.json(rows);
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

/**
 * 2. POST (Add Product)
 */
router.post('/', async (req, res) => {
    try {
        const { name, quantity, price, category } = req.body;
        const sql = 'INSERT INTO products (name, quantity, price, category) VALUES (?, ?, ?, ?)';
        
        await db.query(sql, [name, quantity, price, category]);
        res.status(201).send('Product added successfully');
    } catch (err) {
        console.error("POST Error:", err);
        res.status(500).json({ error: "Failed to add product" });
    }
});

/**
 * 3. PUT (Update Product)
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
 * 4. DELETE Product
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

module.exports = router;