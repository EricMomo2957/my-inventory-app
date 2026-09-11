const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/variants/:productId - Fetch variants for a product
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const [variants] = await db.query(`
            SELECT * FROM product_variants 
            WHERE product_id = ? 
            ORDER BY id ASC
        `, [productId]);
        res.json(variants);
    } catch (err) {
        console.error("Error fetching product variants:", err);
        res.status(500).json({ error: "Failed to load variants" });
    }
});

// POST /api/variants - Add product variant or UOM pack rule
router.post('/', async (req, res) => {
    const { 
        product_id, 
        variant_name, 
        sku, 
        price, 
        cost_price, 
        quantity, 
        uom_type, 
        multiplier, 
        barcode 
    } = req.body;

    if (!product_id || !variant_name) {
        return res.status(400).json({ error: "product_id and variant_name are required" });
    }

    try {
        const [result] = await db.query(`
            INSERT INTO product_variants 
            (product_id, variant_name, sku, price, cost_price, quantity, uom_type, multiplier, barcode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            product_id, 
            variant_name, 
            sku || `VAR-${Math.floor(1000 + Math.random() * 9000)}`, 
            parseFloat(price) || 0.00, 
            parseFloat(cost_price) || 0.00, 
            parseInt(quantity, 10) || 0, 
            uom_type || 'Piece', 
            parseInt(multiplier, 10) || 1, 
            barcode || ''
        ]);

        res.status(201).json({
            id: result.insertId,
            product_id,
            variant_name,
            sku: sku || `VAR-${result.insertId}`,
            message: "Variant added successfully"
        });
    } catch (err) {
        console.error("Error adding variant:", err);
        res.status(500).json({ error: "Failed to add variant" });
    }
});

// DELETE /api/variants/:id - Delete a variant
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM product_variants WHERE id = ?', [id]);
        res.json({ message: "Variant removed" });
    } catch (err) {
        console.error("Error deleting variant:", err);
        res.status(500).json({ error: "Failed to delete variant" });
    }
});

module.exports = router;
