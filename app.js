const express = require('express');
const cors = require('cors'); // Required to fix the connection error
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const scheduleRoutes = require('./routes/schedules'); 
const db = require('./config/db'); 
const orderRoutes = require('./routes/orders');
require('dotenv').config({ quiet: true });

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allows your frontend to communicate with this server
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.static('public')); // Serves your HTML/CSS/JS files
app.use('/api/orders', orderRoutes);
// --- API ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

/**
 * HISTORY FETCH ROUTE
 * Fetches the most recent 10 stock movements for the dashboard history table.
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

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));