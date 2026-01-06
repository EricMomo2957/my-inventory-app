const express = require('express');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const scheduleRoutes = require('./routes/schedules'); 
const db = require('./config/db'); 

require('dotenv').config({ quiet: true });

const app = express();
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

/**
 * 1. RESTOCK ROUTE (MERGED)
 * This updates the inventory and logs the transaction in stock_history
 */
app.patch('/api/products/restock/:id', (req, res) => {
    const productId = req.params.id;
    const { increment, user } = req.body; 

    // Validation
    if (!increment || isNaN(increment) || increment <= 0) {
        return res.status(400).json({ message: "Valid increment value is required" });
    }

    const updateStockSql = "UPDATE products SET quantity = quantity + ?, last_updated = NOW() WHERE id = ?";
    const logHistorySql = "INSERT INTO stock_history (product_id, user_name, change_amount, action_type) VALUES (?, ?, ?, 'restock')";
    
    // Step 1: Update Product Quantity
    db.query(updateStockSql, [increment, productId], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ message: "Database error during update" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Step 2: Log to History (Only if update succeeded)
        db.query(logHistorySql, [productId, user || 'System', increment], (logErr) => {
            if (logErr) {
                console.error("History log failed:", logErr);
                // We still send success for the restock, but log the error internally
            }
            res.json({ message: "Restock successful and logged" });
        });
    });
});

/**
 * 2. HISTORY FETCH ROUTE
 * Gets the 10 most recent restock activities
 */
app.get('/api/history', (req, res) => {
    const sql = `
        SELECT h.*, p.name as product_name 
        FROM stock_history h 
        JOIN products p ON h.product_id = p.id 
        ORDER BY h.created_at DESC LIMIT 10`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Fetch History Error:", err);
            return res.status(500).json({ message: "Error fetching history" });
        }
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));