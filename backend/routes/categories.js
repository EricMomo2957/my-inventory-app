const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/categories - Fetch all categories with dynamic product count & valuation
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.icon, 
                c.color_code, 
                c.status, 
                c.created_at,
                COUNT(p.id) as product_count,
                COALESCE(SUM(p.quantity), 0) as total_units,
                COALESCE(SUM(p.quantity * p.price), 0) as total_valuation
            FROM categories c
            LEFT JOIN products p ON LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
            GROUP BY c.id
            ORDER BY c.name ASC
        `);
        res.json(categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ error: "Failed to load categories" });
    }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
    const { name, description, icon, color_code } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: "Category name is required" });
    }

    try {
        const [result] = await db.query(`
            INSERT INTO categories (name, description, icon, color_code) 
            VALUES (?, ?, ?, ?)
        `, [
            name.trim(), 
            description || '', 
            icon || 'Folder', 
            color_code || '#00684a'
        ]);

        res.status(201).json({
            id: result.insertId,
            name: name.trim(),
            description: description || '',
            icon: icon || 'Folder',
            color_code: color_code || '#00684a',
            status: 'active',
            product_count: 0,
            total_units: 0,
            total_valuation: 0
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Category already exists" });
        }
        console.error("Error creating category:", err);
        res.status(500).json({ error: "Failed to create category" });
    }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, icon, color_code, status } = req.body;

    try {
        await db.query(`
            UPDATE categories 
            SET name = COALESCE(?, name),
                description = COALESCE(?, description),
                icon = COALESCE(?, icon),
                color_code = COALESCE(?, color_code),
                status = COALESCE(?, status)
            WHERE id = ?
        `, [name?.trim(), description, icon, color_code, status, id]);

        res.json({ message: "Category updated successfully" });
    } catch (err) {
        console.error("Error updating category:", err);
        res.status(500).json({ error: "Failed to update category" });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Error deleting category:", err);
        res.status(500).json({ error: "Failed to delete category" });
    }
});

module.exports = router;
