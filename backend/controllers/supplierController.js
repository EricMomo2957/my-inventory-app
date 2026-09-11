const db = require('../config/db');

// 1. GET ALL SUPPLIERS
exports.getAllSuppliers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM suppliers ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error("GET Suppliers Error:", err);
        res.status(500).json({ error: "Failed to fetch suppliers: " + err.message });
    }
};

// 2. GET SINGLE SUPPLIER
exports.getSupplierById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Supplier not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. CREATE SUPPLIER
exports.createSupplier = async (req, res) => {
    const { name, contact_person, email, phone, address, lead_time_days, rating } = req.body;
    if (!name) return res.status(400).json({ error: "Supplier name is required" });

    try {
        const [result] = await db.query(
            'INSERT INTO suppliers (name, contact_person, email, phone, address, lead_time_days, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, contact_person || '', email || '', phone || '', address || '', lead_time_days || 3, rating || 5.0]
        );
        res.status(201).json({ success: true, id: result.insertId, message: "Supplier registered successfully" });
    } catch (err) {
        console.error("POST Supplier Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE SUPPLIER
exports.updateSupplier = async (req, res) => {
    const { name, contact_person, email, phone, address, lead_time_days, rating, status } = req.body;
    try {
        await db.query(
            'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, lead_time_days = ?, rating = ?, status = ? WHERE id = ?',
            [name, contact_person, email, phone, address, lead_time_days, rating, status || 'active', req.params.id]
        );
        res.json({ success: true, message: "Supplier updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE SUPPLIER
exports.deleteSupplier = async (req, res) => {
    try {
        await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "Supplier removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
