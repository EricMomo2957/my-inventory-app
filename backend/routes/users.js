const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

// 1. LOGIN ROUTE (Fixed for Bcrypt)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Step 1: Find user by username only
        const sql = `
            SELECT id, username, password, full_name, role, email, profile_image 
            FROM users 
            WHERE username = ?`;
            
        const [users] = await db.execute(sql, [username]);

        if (users.length > 0) {
            const user = users[0];
            
            // Step 2: Use bcrypt to compare the plain-text password with the hash
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (isMatch) {
                // Remove password from user object before sending to frontend
                delete user.password;
                res.json({ success: true, user: user });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. REGISTER NEW USER (Optimized)
router.post('/register', async (req, res) => {
    const { full_name, username, password, role } = req.body;

    if (!full_name || !username || !password || !role) {
        return res.status(400).json({ success: false, error: "All fields are required" });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Note: I removed the 5th '?' and 'username' as email to match 
        // common table structures unless your table specifically requires it.
        const sql = "INSERT INTO users (full_name, username, password, role) VALUES (?, ?, ?, ?)";
        await db.query(sql, [full_name, username, hashedPassword, role]);
        
        res.json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration Error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, error: "Username already exists." });
        }
        res.status(500).json({ success: false, error: "Database error." });
    }
});

// ... rest of your routes (GET, PUT, DELETE)

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
// 4. UPDATE PROFILE (Matches the script above)
router.put('/profile/:id', async (req, res) => {
    const { full_name, email, department, profile_image } = req.body;
    const userId = req.params.id;

    try {
        const sql = `
            UPDATE users 
            SET full_name = ?, email = ?, department = ?, profile_image = ? 
            WHERE id = ?`;
            
        // Use await db.query if your config/db.js exports a promise-based pool
        await db.query(sql, [full_name, email, department, profile_image, userId]);
        
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ success: false, error: err.message });
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