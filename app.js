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
app.use(express.json()); // Essential for parsing the JSON form data from landing-page.html
app.use(express.static('public')); // Serves landing-page.html, CSS, and JS

// --- API ROUTES ---
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

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

    // Basic validation to ensure fields aren't empty
    if (!name || !email || !message) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    try {
        const sql = "INSERT INTO contact_requests (name, email, message) VALUES (?, ?, ?)";
        
        // Use 'await' to match your 'db' promise-based configuration
        await db.query(sql, [name, email, message]);
        
        console.log(`New contact request from: ${email}`);
        res.json({ status: "success" });
    } catch (err) {
        // If you get a "Table not found" error, ensure you ran the SQL CREATE command
        console.error("Database Contact Error:", err);
        res.status(500).json({ status: "error", message: "Database failure" });
    }
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