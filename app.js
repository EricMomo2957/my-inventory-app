const express = require('express');
const cors = require('cors'); 
const db = require('./config/db');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const scheduleRoutes = require('./routes/schedules'); 
const orderRoutes = require('./routes/orders');
require('dotenv').config({ quiet: true });

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allows frontend/backend communication
app.use(express.json()); // Essential for parsing the JSON form data
app.use(express.static('public')); // Serves HTML, CSS, and JS from the public folder

// --- API ROUTES ---
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

/**
 * PROFILE SYNC ROUTE
 * Used by the Sidenav to get the latest profile picture and name.
 */
app.get('/api/user/profile', async (req, res) => {
    const userId = req.query.id;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    try {
        const [rows] = await db.query("SELECT full_name, role, profile_image FROM users WHERE id = ?", [userId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * HISTORY FETCH ROUTE
 * Fetches recent stock movements for the dashboard.
 */
app.get('/api/history', async (req, res) => {
    try {
        const sql = `
            SELECT h.*, p.name as product_name 
            FROM stock_history h 
            JOIN products p ON h.product_id = p.id 
            ORDER BY h.created_at DESC LIMIT 10`;
        
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Fetch History Error:", err);
        res.status(500).json({ message: "Error fetching history" });
    }
});

/**
 * CONTACT FORM ROUTE
 * Saves "Get In Touch" messages to the database.
 */
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    try {
        const sql = "INSERT INTO contact_requests (name, email, message) VALUES (?, ?, ?)";
        await db.query(sql, [name, email, message]);
        
        console.log(`New contact request from: ${email}`);
        res.json({ status: "success" });
    } catch (err) {
        console.error("Database Contact Error:", err);
        res.status(500).json({ status: "error", message: "Database failure" });
    }
});

/**
 * FAQ ROUTES
 * For managing landing page Questions & Answers.
 */
app.post('/api/faqs', async (req, res) => {
    const { question, answer } = req.body;
    try {
        await db.query("INSERT INTO faqs (question, answer) VALUES (?, ?)", [question, answer]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

app.delete('/api/faqs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM faqs WHERE id = ?", [id]);
        res.json({ success: true, message: "FAQ deleted successfully" });
    } catch (err) {
        console.error("Delete FAQ Error:", err);
        res.status(500).json({ error: "Failed to delete FAQ" });
    }
});

// Default Route: Sends user to the landing page if they hit the base URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/landing-page.html');
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`✅ Inventory Pro Server is running!`);
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log(`📂 Serving files from: /public`);
    console.log(`-------------------------------------------`);
});