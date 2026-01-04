const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.execute(
            'SELECT id, username, full_name, role FROM users WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (users && users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. GET ALL USERS (For the Admin Management Table)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, username, full_name, role FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. REGISTER NEW USER
router.post('/register', async (req, res) => {
    const { username, password, full_name, role } = req.body;
    console.log("Registering User:", req.body); 

    try {
        await db.execute(
            'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
            [username, password, full_name, role]
        );
        res.json({ success: true, message: 'User created' });
    } catch (err) {
        console.error("REGISTRATION ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE PASSWORD (For the Profile Page)
router.patch('/update-password/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [password, id]);
        res.json({ success: true, message: 'Password updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add this to routes/users.js
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;