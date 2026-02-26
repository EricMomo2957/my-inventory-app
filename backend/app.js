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

// --- NEW DATA ROUTE FOR FRONTEND ---
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM products");
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.json([{ id: 1, name: "Sample Item", quantity: 10, price: 100, category: "Supplies" }]);
        }
    } catch (err) {
        res.json([{ id: 1, name: "Sample Item", quantity: 10, price: 100, category: "Supplies" }]);
    }
});

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

/** 1. PLACE A REGISTERED ORDER */
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

/** 2. PLACE A GUEST ORDER */
app.post('/api/guest-orders', async (req, res) => {
    const { customer, items, total } = req.body;
  
    try {
      // 1. Insert into orders table (user_id is NULL for guests)
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, status, guest_name, guest_contact, guest_address) 
        VALUES (NULL, ?, 'pending', ?, ?, ?)
      `;
      
      const [orderResult] = await db.query(orderQuery, [
        total, 
        customer.name, 
        customer.contact, 
        customer.address
      ]);
  
      const orderId = orderResult.insertId;
  
      // 2. Insert order items and decrease product stock
      for (const item of items) {
        // Insert item details into order_items
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
          [orderId, item.id, item.quantity, item.price]
        );
  
        // Update Stock in products table
        await db.query(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }
  
      res.status(201).json({ success: true, message: "Guest order placed successfully!", orderId });
    } catch (err) {
      console.error("Guest Order Error:", err);
      res.status(500).json({ success: false, error: "Failed to process guest order" });
    }
});

// PUT request to update stock and save logs
app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { quantity, adjustment, clerk_name, name } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [results] = await connection.query('SELECT quantity FROM products WHERE id = ?', [productId]);
        if (results.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Product not found" });
        }
        const oldQuantity = results[0].quantity;

        await connection.query('UPDATE products SET quantity = ? WHERE id = ?', [quantity, productId]);

        const logSql = `
            INSERT INTO stock_logs (product_id, product_name, clerk_name, adjustment, old_quantity, new_quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.query(logSql, [productId, name, clerk_name, adjustment, oldQuantity, quantity]);

        await connection.commit();
        res.json({ message: "Stock updated and logged successfully" });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Transaction Error:", err);
        res.status(500).json({ error: "Database transaction failed" });
    } finally {
        if (connection) connection.release();
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


app.put('/api/orders/:id', async (req, res) => {
    const { quantity, total_amount } = req.body;
    const orderId = req.params.id;
    try {
        const sql = "UPDATE orders SET quantity = ?, total_amount = ? WHERE id = ?";
        await db.query(sql, [quantity, total_amount, orderId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/orders/:userId', async (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT 
            o.id, 
            o.total_amount, 
            o.status, 
            o.order_date,
            -- o.quantity removed because it doesn't exist in your DB yet
            p.name AS product_name, 
            p.category, 
            p.price AS unit_price, 
            p.image_url 
        FROM orders o 
        LEFT JOIN products p ON o.product_id = p.id 
        WHERE o.user_id = ? 
        ORDER BY o.order_date DESC
    `;

    try {
        const [rows] = await db.query(sql, [userId]);
        
        // We can manually add a 'quantity' property to the results 
        // by dividing total_amount / unit_price if you want a rough estimate
        const fixedRows = rows.map(row => ({
            ...row,
            quantity: row.unit_price > 0 ? Math.round(row.total_amount / row.unit_price) : 1
        }));

        res.json(fixedRows);
    } catch (err) {
        console.error("Order Fetch Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// --- CONTACT REQUEST ROUTES ---
app.get('/api/contact-requests', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM contact_requests ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch" });
    }
});

app.delete('/api/contact-requests/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM contact_requests WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
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


// --- SCHEDULE EDIT & DELETE ROUTES ---
app.put('/api/schedules/:id', async (req, res) => {
    const { id } = req.params;
    const { title, date, category } = req.body;
    try {
        await db.query("UPDATE schedules SET title = ?, date = ?, category = ? WHERE id = ?", [title, date, category, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.delete('/api/schedules/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM schedules WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// --- AUTHENTICATION: LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query(
            "SELECT id, username, full_name, role FROM users WHERE username = ? AND password = ?", 
            [username, password]
        );
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

/** RESET PASSWORD UPDATE */
app.post('/api/users/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const sql = "UPDATE users SET password = ? WHERE email = 'eric@example.com'"; 
        await db.query(sql, [password]);
        res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});


// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Inventory Pro Server running on http://localhost:${PORT}`);
});