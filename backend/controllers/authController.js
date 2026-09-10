const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    try {
        const sql = `
            SELECT id, username, password, full_name, role, email, department, profile_image 
            FROM users 
            WHERE username = ?`;
            
        const [users] = await db.query(sql, [username]);

        if (users.length > 0) {
            const user = users[0];
            
            let isMatch = false;
            if (user.password && user.password.startsWith('$2')) {
                isMatch = await bcrypt.compare(password, user.password);
            } else {
                isMatch = (password === user.password);
                if (isMatch) {
                    const hashed = await bcrypt.hash(password, 10);
                    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
                }
            }
            
            if (isMatch) {
                delete user.password;
                res.json({ success: true, user: user, token: `token_${user.id}_${Date.now()}` });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 2. REGISTER
exports.register = async (req, res) => {
    const { full_name, username, password, role, email, department } = req.body;

    if (!full_name || !username || !password) {
        return res.status(400).json({ success: false, error: "Full name, username, and password are required" });
    }

    try {
        const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Username is already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'clerk';
        const userDept = department || 'General';
        const userEmail = email || `${username}@inventorypro.com`;

        const sql = `INSERT INTO users (full_name, username, password, role, email, department) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [full_name, username, hashedPassword, userRole, userEmail, userDept]);
        
        res.status(201).json({ 
            success: true, 
            message: "User registered successfully!", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Registration Error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Username or Email already exists." });
        }
        res.status(500).json({ success: false, message: "Database error: " + err.message });
    }
};

// 3. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const [users] = await db.query("SELECT id, full_name, email FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "No account found with that email." });
        }

        const resetToken = Buffer.from(`${users[0].id}:${Date.now()}`).toString('base64');
        res.json({ 
            success: true, 
            message: "Password reset instructions sent.",
            token: resetToken 
        });
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 4. RESET PASSWORD
exports.resetPassword = async (req, res) => {
    const { token, password, email } = req.body;
    if (!password) {
        return res.status(400).json({ success: false, message: "New password is required" });
    }

    try {
        let userId = null;
        if (token) {
            try {
                const decoded = Buffer.from(token, 'base64').toString('utf-8');
                userId = decoded.split(':')[0];
            } catch (e) {
                // Ignore decoding error, fallback to email if present
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let result;

        if (userId) {
            [result] = await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
        } else if (email) {
            [result] = await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);
        } else {
            return res.status(400).json({ success: false, message: "Valid token or email required to reset password." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
