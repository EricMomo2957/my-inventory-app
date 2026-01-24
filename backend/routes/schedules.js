const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * 1. GET all schedules
 * Fetches all events ordered by the 'date' column
 */
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM schedules ORDER BY date ASC');
        res.json(rows);
    } catch (err) {
        console.error("FETCH ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * 2. POST a new schedule
 * Creates a new event (Work, Personal, Delivery, etc.)
 */
router.post('/', async (req, res) => {
    try {
        const { title, date, type } = req.body; 
        const sql = 'INSERT INTO schedules (title, date, type) VALUES (?, ?, ?)';
        await db.query(sql, [title, date, type]);
        
        res.status(201).json({ success: true });
    } catch (err) {
        console.error("DATABASE ERROR:", err); 
        res.status(500).json({ error: err.message });
    }
});

/**
 * 3. UPDATE a schedule (Edit)
 * Updates an existing event based on its ID
 */
router.put('/:id', async (req, res) => {
    try {
        const { title, date, type } = req.body;
        const { id } = req.params;
        const sql = 'UPDATE schedules SET title = ?, date = ?, type = ? WHERE id = ?';
        
        await db.query(sql, [title, date, type, id]);
        res.json({ success: true, message: 'Schedule updated' });
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * 4. DELETE a schedule
 * Removes an event from the database
 */
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;