const express = require('express');
const router = express.Router();
const db = require('../config/db'); // This is your pool.promise()

router.post('/register', async (req, res) => {
    const { full_name, username, password } = req.body;

    try {
        // Use await because db is pool.promise()
        const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
        
        if (rows.length > 0) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Insert using the columns shown in your schema
        // We set 'clerk' as default role, and '0000' as initial admin_id
        const sql = `INSERT INTO users (full_name, username, password, role, admin_id, department) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        
        await db.execute(sql, [
            full_name, 
            username, 
            password, 
            'clerk',     // Default enum value
            '0000',      // Default Admin ID
            'General'    // Default Department
        ]);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database connection failed: " + err.message });
    }
});

module.exports = router;