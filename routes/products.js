const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add a product
router.post('/', async (req, res) => {
    const { name, quantity, price } = req.body;
    await db.query('INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)', [name, quantity, price]);
    res.status(201).send('Product added');
});

// Delete a product
router.delete('/:id', async (req, res) => {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.send('Product deleted');
});

// Update a product
// Update a product
router.put('/:id', async (req, res) => {
    const { name, quantity, price } = req.body;
    const { id } = req.params;
    
    try {
        const sql = 'UPDATE products SET name = ?, quantity = ?, price = ? WHERE id = ?';
        await db.query(sql, [name, quantity, price, id]);
        res.send('Product updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;