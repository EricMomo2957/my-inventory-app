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

// 6. GET SUPPLIED PRODUCTS (Catalog of items sourced from this supplier)
exports.getSuppliedProducts = async (req, res) => {
    const { id } = req.params;
    try {
        const [sup] = await db.query('SELECT name FROM suppliers WHERE id = ?', [id]);
        if (sup.length === 0) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }
        const supplierName = sup[0].name;

        const sql = `
            SELECT 
                p.id,
                p.name,
                p.sku,
                p.category,
                p.quantity AS current_stock,
                p.price AS selling_price,
                p.cost_price AS default_cost,
                p.image_url,
                p.status,
                COALESCE(MAX(pb.cost_price), MAX(poi.unit_cost), p.cost_price) AS latest_purchase_cost,
                COALESCE(MAX(pb.created_at), MAX(po.created_at)) AS last_supplied_date,
                COALESCE(SUM(pb.quantity_received), SUM(poi.quantity_received), 0) AS total_units_supplied,
                COUNT(DISTINCT pb.id) AS batch_count,
                COUNT(DISTINCT po.id) AS po_count
            FROM products p
            LEFT JOIN product_batches pb ON p.id = pb.product_id AND (pb.supplier = ? OR pb.supplier LIKE ?)
            LEFT JOIN po_items poi ON p.id = poi.product_id
            LEFT JOIN purchase_orders po ON poi.po_id = po.id AND (po.supplier_id = ? OR po.supplier_name = ?)
            WHERE (pb.id IS NOT NULL OR po.id IS NOT NULL)
            GROUP BY p.id, p.name, p.sku, p.category, p.quantity, p.price, p.cost_price, p.image_url, p.status
            ORDER BY last_supplied_date DESC, p.name ASC
        `;
        
        let [rows] = await db.query(sql, [supplierName, `%${supplierName}%`, id, supplierName]);

        if (rows.length === 0) {
            const [fallbackRows] = await db.query(`
                SELECT 
                    p.id, p.name, p.sku, p.category, p.quantity AS current_stock, 
                    p.price AS selling_price, p.cost_price AS latest_purchase_cost, 
                    p.image_url, p.status, NULL AS last_supplied_date, 0 AS total_units_supplied
                FROM products p
                WHERE p.status = 'active'
                ORDER BY p.id ASC
                LIMIT 6
            `);
            rows = fallbackRows.map(r => ({ ...r, is_suggested: true }));
        }

        res.json({
            success: true,
            supplier_id: id,
            supplier_name: supplierName,
            products: rows
        });
    } catch (err) {
        console.error("GET Supplied Products Error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch supplied products: " + err.message });
    }
};
