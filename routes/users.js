const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Points to your pool.promise()

// 1. LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Updated to fetch ALL necessary profile columns
        const sql = `
            SELECT id, username, full_name, role, email, admin_id, department, profile_image 
            FROM users 
            WHERE username = ? AND password = ?`;
            
        const [users] = await db.execute(sql, [username, password]);

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

// 2. REGISTER NEW USER
router.post('/register', async (req, res) => {
    const { full_name, username, password } = req.body;

    try {
        // Check if username already exists
        const [exists] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (exists.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Insert into specific columns based on your database structure
        const sql = `INSERT INTO users (full_name, username, password, role, admin_id, department) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        
        await db.execute(sql, [
            full_name, 
            username, 
            password, 
            'clerk',     // Default value from your ENUM
            '0000',      // Default temporary Admin ID
            'General'    // Default placeholder department
        ]);

        res.status(201).json({ success: true, message: "Registration successful!" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// 3. GET ALL USERS (For Admin Management Table)
router.get('/', async (req, res) => {
    try {
        // Fetching common fields for the management list
        const [rows] = await db.execute('SELECT id, username, full_name, role, department FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE PROFILE (For the Edit Profile modal)
router.put('/profile/:id', async (req, res) => {
    const { full_name, email, department, profile_image } = req.body;
    const userId = req.params.id;

    try {
        // profile_image uses LONGTEXT to store Base64 strings
        const sql = `
            UPDATE users 
            SET full_name = ?, email = ?, department = ?, profile_image = ? 
            WHERE id = ?`;
            
        await db.execute(sql, [full_name, email, department, profile_image, userId]);
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ error: "Failed to update profile: " + err.message });
    }
});

// 5. UPDATE PASSWORD (Security Section)
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

// 6. DELETE USER
router.delete('/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Matches fetch('/api/users/all')
router.get('/all', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;