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
app.use(cors()); 
app.use(express.json()); 
app.use(express.static('public')); 

// --- EXISTING API ROUTES ---
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/schedules', scheduleRoutes); 

// --- NEW ORDERING ROUTES (Added & Converted to Async/Await) ---

/** 1. PLACE AN ORDER: Used by the Order Now button */
app.post('/api/orders', async (req, res) => {
    const { user_id, product_id, quantity, price } = req.body;
    const total_amount = price * quantity;

    try {
        // ADDED: product_id to the column list and values
        const sqlOrder = 'INSERT INTO orders (user_id, product_id, total_amount, status) VALUES (?, ?, ?, "completed")';
        await db.query(sqlOrder, [user_id, product_id, total_amount]);

        // Second, subtract the quantity from products table
        const updateStock = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
        await db.query(updateStock, [quantity, product_id]);

        res.json({ success: true, message: "Order placed successfully" });
    } catch (err) {
        console.error("Order Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});


app.get('/api/orders/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    // The JOIN is essential to get the product name and image from the products table
    const sql = `
        SELECT o.*, p.name AS product_name, p.image_url 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        WHERE o.user_id = ? 
        ORDER BY o.order_date DESC
    `;
    
    try {
        // CHANGED: Use [rows] destructuring to handle the Promise returned by your db config
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch order history" });
    }
});

/** FETCH ALL CONTACT REQUESTS: For the Management Page */
app.get('/api/contact-requests', async (req, res) => {
    try {
        // This pulls id, name, email, message, and date from your DB
        const [rows] = await db.query("SELECT * FROM contact_requests ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch contact requests" });
    }
});

/** DELETE A CONTACT REQUEST: Triggered by the Delete button on the frontend */
app.delete('/api/contact-requests/:id', async (req, res) => {
    const requestId = req.params.id;
    try {
        const sql = "DELETE FROM contact_requests WHERE id = ?";
        await db.query(sql, [requestId]);
        
        console.log(`🗑️ Deleted contact request ID: ${requestId}`);
        res.json({ success: true, message: "Request deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});


/** 2. GET ORDER HISTORY: For the User Order History Page */
// --- GET ORDER HISTORY BY USER ID ---
app.get('/api/orders/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // This query links the orders and products tables together
    const sql = `
        SELECT o.*, p.name AS product_name, p.image_url 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        WHERE o.user_id = ? 
        ORDER BY o.order_date DESC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to fetch order history" });
        }
        res.json(results);
    });
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