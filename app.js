const express = require('express');
const cors = require('cors'); 
const db = require('./config/db'); 
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const scheduleRoutes = require('./routes/schedules'); 
const orderRoutes = require('./routes/orders');
const multer = require('multer'); 
const path = require('path');   
require('dotenv').config({ quiet: true });

const app = express();

// --- MULTER SETUP (For Profile Photos) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public')); 
// IMPORTANT: Serves the uploads folder so profile images are accessible via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- EXISTING API ROUTES ---
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

// --- PROFILE UPDATE ROUTE ---
app.put('/api/users/update', upload.single('profile_pic'), async (req, res) => {
    const { id, full_name, email, password } = req.body;
    let profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        let query = "UPDATE users SET full_name = ?, email = ?";
        let params = [full_name, email];

        if (password && password.trim() !== "") {
            query += ", password = ?";
            params.push(password);
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
            message: "Profile updated!", 
            profile_image: profile_image 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database update failed." });
    }
});

// --- ORDERING ROUTES ---

/** 1. PLACE AN ORDER */
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

/** DELETE A CUSTOMER ORDER */
app.delete('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
        const [result] = await db.query("DELETE FROM orders WHERE id = ?", [orderId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        res.json({ success: true, message: "Order deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not delete order." });
    }
});

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
        res.status(500).json({ error: "Failed to fetch order history" });
    }
});

// --- CONTACT REQUEST ROUTES ---

app.get('/api/contact-requests', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM contact_requests ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch contact requests" });
    }
});

app.delete('/api/contact-requests/:id', async (req, res) => {
    const requestId = req.params.id;
    try {
        await db.query("DELETE FROM contact_requests WHERE id = ?", [requestId]);
        res.json({ success: true, message: "Request deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- REPORT/BI ROUTES ---

app.get('/api/products/report', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT name, quantity, price, category FROM products");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/sales', async (req, res) => {
    const days = req.query.days || 30;
    try {
        const sql = `
            SELECT p.name, oi.quantity, oi.price_at_time, o.order_date 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
            AND o.status = 'completed'`;
        const [rows] = await db.query(sql, [parseInt(days)]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PROFILE & UTILITY ROUTES ---

app.get('/api/user/profile', async (req, res) => {
    const userId = req.query.id;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    try {
        const [rows] = await db.query("SELECT full_name, role, profile_image FROM users WHERE id = ?", [userId]);
        rows.length > 0 ? res.json(rows[0]) : res.status(404).json({ error: "User not found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await db.query("INSERT INTO contact_requests (name, email, message) VALUES (?, ?, ?)", [name, email, message]);
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ status: "error" });
    }
});

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