const db = require('./db');

async function initDatabase() {
    try {
        // 1. Ensure location columns exist on products table
        const [productCols] = await db.query('SHOW COLUMNS FROM products');
        const colNames = productCols.map(c => c.Field);

        if (!colNames.includes('location_zone')) {
            await db.query("ALTER TABLE products ADD COLUMN location_zone VARCHAR(50) DEFAULT 'Zone A'");
        }
        if (!colNames.includes('location_aisle')) {
            await db.query("ALTER TABLE products ADD COLUMN location_aisle VARCHAR(50) DEFAULT 'Aisle 01'");
        }
        if (!colNames.includes('location_rack')) {
            await db.query("ALTER TABLE products ADD COLUMN location_rack VARCHAR(50) DEFAULT 'Rack 01'");
        }
        if (!colNames.includes('location_bin')) {
            await db.query("ALTER TABLE products ADD COLUMN location_bin VARCHAR(50) DEFAULT 'Bin 01'");
        }

        // 2. Suppliers Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact_person VARCHAR(150),
                email VARCHAR(150),
                phone VARCHAR(50),
                address TEXT,
                lead_time_days INT DEFAULT 3,
                rating DECIMAL(2,1) DEFAULT 4.8,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // 3. Purchase Orders Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS purchase_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                po_number VARCHAR(50) UNIQUE NOT NULL,
                supplier_id INT,
                supplier_name VARCHAR(255),
                total_amount DECIMAL(12,2) DEFAULT 0.00,
                status ENUM('draft', 'ordered', 'received', 'cancelled') DEFAULT 'ordered',
                expected_date DATE,
                notes TEXT,
                created_by VARCHAR(100) DEFAULT 'Administrator',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (supplier_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // 4. Purchase Order Items Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS po_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                po_id INT NOT NULL,
                product_id INT,
                product_name VARCHAR(255) NOT NULL,
                quantity_ordered INT NOT NULL,
                quantity_received INT DEFAULT 0,
                unit_cost DECIMAL(10,2) NOT NULL,
                total_cost DECIMAL(12,2) NOT NULL,
                INDEX (po_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // 5. Seed default suppliers if empty
        const [existingSuppliers] = await db.query('SELECT COUNT(*) as count FROM suppliers');
        if (existingSuppliers[0].count === 0) {
            await db.query(`
                INSERT INTO suppliers (name, contact_person, email, phone, address, lead_time_days, rating) VALUES
                ('Prime Logistics & Hardware Supplies', 'Marcus Vance', 'marcus@primelogistics.com', '+63 917 555 1024', 'Block 4, Warehouse Complex, Cavite', 2, 4.9),
                ('AgriFresh Harvest Co.', 'Elena Rostova', 'elena@agrifresh.com', '+63 918 555 4910', 'Highland Farm Hub, Benguet', 3, 4.7),
                ('Universal Packaging & Tools Corp.', 'David Chen', 'sales@universalpack.com', '+63 920 555 7712', 'Port Area Industrial Park, Manila', 4, 4.8),
                ('Apex Industrial Raw Materials', 'Sarah Jenkins', 'sjenkins@apexraw.com', '+63 922 555 3388', 'Export Processing Zone, Laguna', 5, 4.6);
            `);
        }

        // 6. Seed sample Purchase Orders if empty
        const [existingPOs] = await db.query('SELECT COUNT(*) as count FROM purchase_orders');
        if (existingPOs[0].count === 0) {
            await db.query(`
                INSERT INTO purchase_orders (po_number, supplier_id, supplier_name, total_amount, status, expected_date, notes, created_by) VALUES
                ('PO-2026-0891', 1, 'Prime Logistics & Hardware Supplies', 45200.00, 'ordered', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), 'Quarterly hardware parts replenishment', 'System Administrator'),
                ('PO-2026-0892', 2, 'AgriFresh Harvest Co.', 18450.00, 'received', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'Direct floor inventory restock - Delivered', 'System Administrator'),
                ('PO-2026-0893', 3, 'Universal Packaging & Tools Corp.', 9800.00, 'draft', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), 'Cardboard cartons and seal rolls requisition', 'System Administrator');
            `);
        }

        console.log("✅ MindStock Enhanced Database schema successfully initialized.");
    } catch (err) {
        console.error("Database initialization notice:", err.message);
    }
}

module.exports = { initDatabase };
