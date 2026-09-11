const express = require('express');
const cors = require('cors'); 
const path = require('path');
const fs = require('fs');
require('dotenv').config({ quiet: true });

const db = require('./config/db'); 
const { initDatabase } = require('./config/initDatabase');

// Run automatic schema upgrade & migrations
initDatabase().catch(err => console.error("Database migration notice:", err.message));

// Import Modular Routers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const scheduleRoutes = require('./routes/schedules'); 
const reportRoutes = require('./routes/reports');
const supplierRoutes = require('./routes/suppliers');
const poRoutes = require('./routes/purchaseOrders');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static uploads and images
app.use('/uploads', express.static(uploadsDir));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- PRIMARY MODULAR API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/schedules', scheduleRoutes); 
app.use('/api/reports', reportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- COMPATIBILITY & ALIAS ENDPOINTS ---

// Auth Aliases
app.post('/api/login', (req, res, next) => {
    req.url = '/login';
    authRoutes(req, res, next);
});

app.post('/api/register', (req, res, next) => {
    req.url = '/register';
    authRoutes(req, res, next);
});

app.post('/api/users/forgot-password', (req, res, next) => {
    req.url = '/forgot-password';
    authRoutes(req, res, next);
});

app.post('/api/users/reset-password', (req, res, next) => {
    req.url = '/reset-password';
    authRoutes(req, res, next);
});

// Order Aliases
app.post('/api/guest-orders', (req, res, next) => {
    req.url = '/guest-orders';
    orderRoutes(req, res, next);
});

// Profile Alias
app.get('/api/user/profile', (req, res, next) => {
    req.url = '/profile';
    userRoutes(req, res, next);
});

// --- STOCK HISTORY (Audit Logs) ---
app.get('/api/stock-history', async (req, res) => {
    try {
        let rows = [];
        try {
            [rows] = await db.query(`
                SELECT 
                    sh.id, 
                    sh.product_id, 
                    COALESCE(p.name, CONCAT('Product #', sh.product_id)) AS product_name,
                    p.image_url,
                    p.category,
                    sh.user_name, 
                    sh.change_amount, 
                    sh.action_type, 
                    sh.reference_no,
                    sh.notes,
                    sh.created_at 
                FROM stock_history sh
                LEFT JOIN products p ON sh.product_id = p.id
                ORDER BY sh.id DESC
            `);
        } catch (e) {
            try {
                [rows] = await db.query(`
                    SELECT 
                        sl.id, 
                        sl.product_id, 
                        COALESCE(sl.product_name, p.name, CONCAT('Product #', sl.product_id)) AS product_name, 
                        sl.clerk_name AS user_name, 
                        sl.adjustment AS change_amount, 
                        'adjustment' AS action_type,
                        sl.created_at 
                    FROM stock_logs sl
                    LEFT JOIN products p ON sl.product_id = p.id
                    ORDER BY sl.id DESC
                `);
            } catch (err2) {
                rows = [];
            }
        }
        res.json(rows);
    } catch (err) {
        console.error("Stock History Error:", err);
        res.json([]);
    }
});

// --- FAVORITES API ---
app.post('/api/favorites', async (req, res) => {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
        return res.status(400).json({ error: "userId and productId are required" });
    }

    try {
        const [exists] = await db.query('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
        
        if (exists.length > 0) {
            await db.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
            res.json({ message: "Removed from favorites", isFavorite: false });
        } else {
            await db.query('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
            res.json({ message: "Added to favorites", isFavorite: true });
        }
    } catch (err) {
        console.error("Favorites Toggle Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/favorites/:userId', async (req, res) => {
    const { userId } = req.params;
    const sql = `
        SELECT p.* FROM products p
        JOIN favorites f ON p.id = f.product_id
        WHERE f.user_id = ?
    `;
    try {
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Fetch Favorites Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- CONTACT REQUESTS ---
app.get('/api/contact-requests', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM contact_requests ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch inquiries" });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await db.query("INSERT INTO contact_requests (name, email, message) VALUES (?, ?, ?)", [name, email, message]);
        res.json({ success: true, message: "Contact request submitted successfully" });
    } catch (err) {
        console.error("Contact Submit Error:", err);
        res.status(500).json({ success: false, error: err.message });
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

// --- FAQS API ---
app.get('/api/faqs', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM faqs ORDER BY id ASC");
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.json([
                { id: 1, question: "How does real-time stock sync work?", answer: "Stock updates immediately upon checkout across all clerk and admin portals." },
                { id: 2, question: "Can I manage user permissions?", answer: "Yes, administrators have full access to create, edit, and assign roles to clerks and staff." },
                { id: 3, question: "Is data backed up?", answer: "All database transactions are logged with complete rollback protection to avoid ghost orders." }
            ]);
        }
    } catch (err) {
        res.json([
            { id: 1, question: "How does real-time stock sync work?", answer: "Stock updates immediately upon checkout across all clerk and admin portals." },
            { id: 2, question: "Can I manage user permissions?", answer: "Yes, administrators have full access to create, edit, and assign roles to clerks and staff." }
        ]);
    }
});

// Root Healthcheck
app.get('/', (req, res) => {
    res.json({ 
        name: "Inventory Pro API Server", 
        version: "1.0.0", 
        status: "online", 
        docs: "/api/*" 
    });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Inventory Pro Server running on http://localhost:${PORT}`);
});