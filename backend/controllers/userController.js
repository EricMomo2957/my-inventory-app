const db = require('../config/db'); 
const bcrypt = require('bcryptjs');

// 1. GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, full_name, role, email, department, profile_image FROM users ORDER BY id DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error("Fetch Users Error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// 2. GET SINGLE USER PROFILE
exports.getUserProfile = async (req, res) => {
    const userId = req.query.id || req.params.id;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    try {
        const [rows] = await db.query(
            "SELECT id, username, full_name, role, email, department, profile_image FROM users WHERE id = ?", 
            [userId]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. CREATE USER (Admin)
exports.createUser = async (req, res) => {
    const { username, password, full_name, role, email, department } = req.body;
    if (!username || !password || !full_name) {
        return res.status(400).json({ success: false, message: "Username, password, and full name are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, password, full_name, role, email, department) VALUES (?, ?, ?, ?, ?, ?)";
        const [result] = await db.query(sql, [
            username, 
            hashedPassword, 
            full_name, 
            role || 'clerk', 
            email || `${username}@inventorypro.com`, 
            department || 'General'
        ]);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        console.error("Create User Error:", err);
        res.status(500).json({ success: false, message: "Username or Email might already exist." });
    }
};

// 4. UPDATE USER PROFILE (With Multer image support)
exports.updateProfile = async (req, res) => {
    const { id, full_name, email, password, department } = req.body;
    let profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        let query = "UPDATE users SET full_name = ?, email = ?";
        let params = [full_name, email];

        if (department) {
            query += ", department = ?";
            params.push(department);
        }
        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ", password = ?";
            params.push(hashedPassword);
        }
        if (profile_image) {
            query += ", profile_image = ?";
            params.push(profile_image);
        }

        query += " WHERE id = ?";
        params.push(id);

        await db.query(query, params);
        
        res.json({ 
            success: true, 
            message: "Profile updated successfully!", 
            profile_image: profile_image 
        });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ success: false, message: "Database update failed." });
    }
};

// 5. UPDATE USER BY ID (Admin edit modal)
exports.updateUser = async (req, res) => {
    const { full_name, role, department, email } = req.body;
    const userId = req.params.id;

    try {
        const sql = `UPDATE users SET full_name = ?, role = ?, department = ?, email = ? WHERE id = ?`;
        const [result] = await db.query(sql, [full_name, role, department, email || `${full_name.toLowerCase().replace(/\s+/g, '')}@inventorypro.com`, userId]);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "User updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 6. UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 7. DELETE USER
exports.deleteUser = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
