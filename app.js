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

// --- NEW ORDERING ROUTES ---

/** 1. PLACE AN ORDER: Used by the Order Now button */
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

/** DELETE A CUSTOMER ORDER: Fixed column name */
app.delete('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
        // Changed 'order_id' to 'id' to match standard database schemas
        const [result] = await db.query("DELETE FROM orders WHERE id = ?", [orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found. It may have already been deleted." 
            });
        }

        console.log(`🗑️ Order ID: ${orderId} deleted successfully.`);
        res.json({ success: true, message: "Order deleted successfully." });
    } catch (err) {
        console.error("Delete Order Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error. Could not delete order." 
        });
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
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch order history" });
    }
});

/** FETCH ALL CONTACT REQUESTS */
app.get('/api/contact-requests', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM contact_requests ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Failed to fetch contact requests" });
    }
});

/** DELETE A CONTACT REQUEST */
app.delete('/api/contact-requests/:id', async (req, res) => {
    const requestId = req.params.id;
    try {
        const sql = "DELETE FROM contact_requests WHERE id = ?";
        await db.query(sql, [requestId]);
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

app.post('/api/contact-requests/:id/respond', (req, res) => {
    const requestId = req.params.id;
    const adminMessage = req.body.response;
    if (adminMessage) {
        res.status(200).json({ message: "Response sent successfully!" });
    } else {
        res.status(400).json({ error: "Message content is required" });
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


app.put('/api/users/update', async (req, res) => {
    const { id, full_name, email, password } = req.body;
    try {
        let sql, params;
        if (password && password.trim() !== "") {
            // Update with new password
            sql = "UPDATE users SET full_name = ?, email = ?, password = ? WHERE id = ?";
            params = [full_name, email, password, id];
        } else {
            // Update without changing password
            sql = "UPDATE users SET full_name = ?, email = ? WHERE id = ?";
            params = [full_name, email, id];
        }
        
        await db.query(sql, params);
        res.json({ success: true, message: "Profile updated!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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