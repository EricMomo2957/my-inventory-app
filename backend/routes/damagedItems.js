const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/damaged-items - Fetch all damaged records
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                d.id,
                d.product_id,
                d.product_name,
                d.quantity,
                d.cost_price,
                d.total_loss,
                d.reason,
                d.condition_type,
                d.supplier_id,
                d.supplier_name,
                d.status,
                d.reference_no,
                d.logged_by,
                d.notes,
                d.created_at,
                p.image_url,
                p.category
            FROM damaged_items d
            LEFT JOIN products p ON d.product_id = p.id
            ORDER BY d.id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching damaged items:", err);
        res.status(500).json({ error: "Failed to load damaged items" });
    }
});

// POST /api/damaged-items - Log new damaged/lost item and deduct from stock
router.post('/', async (req, res) => {
    const { 
        product_id, 
        product_name, 
        quantity, 
        cost_price, 
        reason, 
        condition_type, 
        supplier_id, 
        supplier_name, 
        logged_by, 
        notes 
    } = req.body;

    const qty = parseInt(quantity, 10);
    if (!product_id || isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: "Valid product and quantity required" });
    }

    const unitCost = parseFloat(cost_price) || 0.00;
    const totalLoss = Math.round(unitCost * qty * 100) / 100;
    const refNo = condition_type === 'defective' || supplier_name 
        ? `RTV-${Math.floor(100000 + Math.random() * 900000)}` 
        : `DMG-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
        // 1. Insert into damaged_items table
        const [result] = await db.query(`
            INSERT INTO damaged_items 
            (product_id, product_name, quantity, cost_price, total_loss, reason, condition_type, supplier_id, supplier_name, status, reference_no, logged_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            product_id, 
            product_name || `Product #${product_id}`, 
            qty, 
            unitCost, 
            totalLoss, 
            reason || 'Damaged / Spoilage Deduction', 
            condition_type || 'damaged', 
            supplier_id || null, 
            supplier_name || 'General Supplier', 
            condition_type === 'defective' ? 'rtv_claimed' : 'quarantined', 
            refNo, 
            logged_by || 'Warehouse Clerk', 
            notes || ''
        ]);

        // 2. Automatically deduct quantity from active warehouse stock
        await db.query(`
            UPDATE products 
            SET quantity = GREATEST(0, quantity - ?) 
            WHERE id = ?
        `, [qty, product_id]);

        // 3. Log into stock movement audit ledger
        try {
            await db.query(`
                INSERT INTO stock_history (product_id, user_name, change_amount, action_type, reference_no, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                product_id, 
                logged_by || 'Warehouse Clerk', 
                -qty, 
                'damaged_writeoff', 
                refNo, 
                `Quarantined/Damaged: ${reason} (Loss: ₱${totalLoss.toFixed(2)})`
            ]);
        } catch (e) {
            console.warn("Stock history logging notice:", e.message);
        }

        res.status(201).json({
            id: result.insertId,
            reference_no: refNo,
            message: `Successfully logged ${qty} damaged units into quarantine.`
        });
    } catch (err) {
        console.error("Error logging damaged item:", err);
        res.status(500).json({ error: "Failed to record damaged item" });
    }
});

// PUT /api/damaged-items/:id/status - Update RTV / Resolution status
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    try {
        await db.query(`
            UPDATE damaged_items 
            SET status = ?, 
                notes = CONCAT(COALESCE(notes, ''), ' | Status Update: ', ?) 
            WHERE id = ?
        `, [status, notes || status, id]);

        res.json({ message: "Damaged item claim status updated" });
    } catch (err) {
        console.error("Error updating damage status:", err);
        res.status(500).json({ error: "Failed to update claim status" });
    }
});

module.exports = router;
