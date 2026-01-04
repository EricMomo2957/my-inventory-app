const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all schedules
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM schedules ORDER BY schedule_date ASC');
        res.json(rows);
    } catch (err) {
        console.error("FETCH ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST a new schedule
router.post('/', async (req, res) => {
    const { title, schedule_date, type } = req.body;
    
    // Debugging: This will show in your server terminal
    console.log("Receiving data:", req.body);

    try {
        await db.execute(
            'INSERT INTO schedules (title, schedule_date, type) VALUES (?, ?, ?)',
            [title, schedule_date, type]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("DATABASE ERROR:", err); 
        res.status(500).json({ error: err.message });
    }
});

// DELETE a schedule
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM schedules WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;