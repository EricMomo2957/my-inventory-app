const express = require('express');
const cors = require('cors'); 
const db = require('./config/db'); // Using your existing DB config
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const scheduleRoutes = require('./routes/schedules'); 
const orderRoutes = require('./routes/orders');
require('dotenv').config({ quiet: true });

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 

// --- EXISTING API ROUTES ---
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

// --- NEW REPORT/BI ROUTES (Merged here) ---

/** 1. PRODUCTS DATA: For Inventory Value & Stock Levels */
app.get('/api/products/report', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT name, quantity, price, category FROM products");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/** 2. SALES DATA: For Total Revenue & Top Products */
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

/** 3. STOCK HISTORY: For the Fluctuation Trend Chart */
app.get('/api/reports/stock-history', async (req, res) => {
    const days = req.query.days || 30;
    try {
        const sql = `
            SELECT change_amount, created_at 
            FROM stock_history 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY created_at ASC`;
        
        const [rows] = await db.query(sql, [parseInt(days)]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- REMAINING EXISTING ROUTES (Profile, History, Contact, FAQs) ---

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

app.get('/api/history', async (req, res) => {
    try {
        const sql = `SELECT h.*, p.name as product_name FROM stock_history h JOIN products p ON h.product_id = p.id ORDER BY h.created_at DESC LIMIT 10`;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching history" });
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
    console.log(`✅ Inventory Pro Server merged and running on http://localhost:${PORT}`);
});