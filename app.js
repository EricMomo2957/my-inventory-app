const express = require('express');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const scheduleRoutes = require('./routes/schedules'); 
const db = require('./config/db'); 

require('dotenv').config({ quiet: true });

const app = express();
app.use(express.json());
app.use(express.static('public'));

/**
 * API ROUTES
 * Note: Restock is now handled inside productRoutes (/api/products/restock/:id)
 */
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

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));