const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Uses your existing DB connection

// Simple login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", username, password); // Debug 1

    try {
        // Change: Ensure your DB driver is returning [rows, fields]
        const result = await db.execute(
            'SELECT id, username, role FROM users WHERE username = ? AND password = ?', 
            [username, password]
        );
        
        const users = result[0]; // The first index contains the rows
        console.log("Database match:", users); // Debug 2

        if (users && users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error("Database error:", err); // Debug 3
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;