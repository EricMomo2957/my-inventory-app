const express = require('express');
const cors = require('cors'); 
const db = require('./config/db'); 
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const scheduleRoutes = require('./routes/schedules'); 
const orderRoutes = require('./routes/orders');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ quiet: true });

const app = express();

// --- ENSURE UPLOAD DIRECTORY EXISTS ---
const uploadDir = './uploads/profiles/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'user-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 
app.use('/uploads', express.static('uploads'));

// --- EXISTING API ROUTES ---
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

// --- ORDERING ROUTES ---

/** PLACE AN ORDER */
app.post('/api/orders', async (req, res) => {
    const { user_id, product_id, quantity, price } = req.body;
    const total_amount = price * quantity;

    try {
        const sqlOrder = 'INSERT INTO orders (user_id, product_id, total_amount, status) VALUES (?, ?, ?, "completed")';
        await db.query(sqlOrder, [user_id, product_id, total_amount]);

        const updateStock = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
        await db.query(updateStock, [quantity, product_id]);

        res.json({ success: true, message: "Order placed successfully" });
    } catch (err) {
        console.error("Order Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/** DELETE A CUSTOMER ORDER - Fix for Image 4 error */
app.delete('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
        // We use the ID directly from the URL params
        const [result] = await db.query("DELETE FROM orders WHERE id = ?", [orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found on server." });
        }

        res.json({ success: true, message: "Order deleted successfully." });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, message: "Server Error: Could not delete." });
    }
});

/** FETCH ORDER HISTORY */
app.get('/api/orders/:userId', async (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT o.*, p.name AS product_name, p.image_url 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        WHERE o.user_id = ? 
        ORDER BY o.order_date DESC
    `;
    try {
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// --- CONTACT REQUESTS ---

/** FETCH ALL CONTACT REQUESTS */
app.get('/api/contact-requests', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM contact_requests ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch contact requests" });
    }
});

/** RESPOND TO CONTACT REQUEST - Fix for Image 2 error */
app.post('/api/contact-requests/:id/respond', async (req, res) => {
    const requestId = req.params.id;
    const { response } = req.body;
    
    if (!response) {
        return res.status(400).json({ error: "Message content is required" });
    }

    try {
        // Optionally update a 'status' or 'admin_response' column in your DB
        const sql = "UPDATE contact_requests SET message = CONCAT(message, '\n\nAdmin Response: ', ?) WHERE id = ?";
        await db.query(sql, [response, requestId]);
        
        res.status(200).json({ success: true, message: "Response sent successfully!" });
    } catch (err) {
        console.error("Response Error:", err);
        res.status(500).json({ error: "Server Error: Failed to send response." });
    }
});

// --- PROFILE & SETTINGS ---

/** FETCH USER PROFILE */
app.get('/api/user/profile', async (req, res) => {
    const userId = req.query.id;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    try {
        // Ensure column name matches your DB (profile_image vs profile_pic)
        const [rows] = await db.query("SELECT full_name, role, profile_image, email FROM users WHERE id = ?", [userId]);
        rows.length > 0 ? res.json(rows[0]) : res.status(404).json({ error: "User not found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** UPDATED PROFILE UPDATE - Fix for Image 5 error */
app.put('/api/users/update', upload.single('profile_pic'), async (req, res) => {
    const { id, full_name, email, password } = req.body;
    const profilePicUrl = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    try {
        let sql = "UPDATE users SET full_name = ?, email = ?";
        let params = [full_name, email];

        if (password && password.trim() !== "") {
            sql += ", password = ?";
            params.push(password);
        }
        
        if (profilePicUrl) {
            // Check if your DB column is 'profile_image' or 'profile_pic'
            sql += ", profile_image = ?"; 
            params.push(profilePicUrl);
        }

        sql += " WHERE id = ?";
        params.push(id);

        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated!", profile_image: profilePicUrl });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false, message: "Database Error: " + err.message });
    }
});

// --- OTHER UTILITIES ---

app.get('/api/faqs', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM faqs ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/landing-page.html');
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Inventory Pro Server running on http://localhost:${PORT}`);
});