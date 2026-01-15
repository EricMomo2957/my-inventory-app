const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Points to your pool.promise()

const bcrypt = require('bcryptjs');

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
// 2. REGISTER NEW USER
router.post('/register', async (req, res) => {
    const { full_name, username, password, role } = req.body;

    if (!full_name || !username || !password || !role) {
        return res.status(400).json({ success: false, error: "All fields are required" });
    }

    try {
        // --- ADDED: Hash the password before saving ---
        const hashedPassword = await bcrypt.hash(password, 10);

        // Updated query to use hashedPassword
        const sql = "INSERT INTO users (full_name, username, password, role, email) VALUES (?, ?, ?, ?, ?)";
        await db.query(sql, [full_name, username, hashedPassword, role, username]);
        
        res.json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration Error:", err);
        // Error here is likely due to the ENUM missing the 'user' value in MySQL
        res.status(500).json({ success: false, error: "Database error. Ensure the 'user' role is allowed in the ENUM list." });
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

router.post('/update-profile', async (req, res) => {
    const { userId, full_name, profile_image } = req.body;
    try {
        await db.execute(
            'UPDATE users SET full_name = ?, profile_image = ? WHERE id = ?',
            [full_name, profile_image, userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Password Route
router.post('/update-password', async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        // 1. Hash the new password (10 salt rounds)
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 2. Update the database
        const [result] = await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Password updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Password Update Error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;