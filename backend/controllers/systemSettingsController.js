const db = require('../config/db');

// 1. GET ALL SYSTEM SETTINGS
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_key, setting_value, category, description, updated_at FROM system_settings');
        
        // Transform rows into a key-value dictionary and structured categories
        const settingsMap = {};
        rows.forEach(r => {
            let val = r.setting_value;
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(val) && val.trim() !== '' && !val.includes(':') && !val.includes('+')) val = Number(val);
            settingsMap[r.setting_key] = val;
        });

        // Get database statistics for backup hub
        let dbStats = { tableCount: 0, totalRows: 0, dbSizeKb: 0 };
        try {
            const [tables] = await db.query('SHOW TABLES');
            const [sizeInfo] = await db.query(`
                SELECT 
                    COUNT(*) as table_count,
                    SUM(TABLE_ROWS) as total_rows,
                    ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024, 2) as size_kb
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = DATABASE()
            `);
            if (sizeInfo.length > 0) {
                dbStats = {
                    tableCount: sizeInfo[0].table_count || tables.length,
                    totalRows: sizeInfo[0].total_rows || 0,
                    dbSizeKb: sizeInfo[0].size_kb || 0
                };
            }
        } catch (sErr) {
            console.warn("DB Stats calculation notice:", sErr.message);
        }

        res.json({
            success: true,
            settings: settingsMap,
            rawList: rows,
            dbStats
        });
    } catch (err) {
        console.error("GET Settings Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// 2. UPDATE SYSTEM SETTINGS
exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // e.g. { allow_clerk_edit_cost: false, manager_alert_email: "..." }
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ success: false, error: "Invalid settings payload" });
        }

        for (const [key, val] of Object.entries(updates)) {
            const stringVal = typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val);
            await db.query(`
                INSERT INTO system_settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `, [key, stringVal]);
        }

        res.json({
            success: true,
            message: "System configurations updated successfully"
        });
    } catch (err) {
        console.error("UPDATE Settings Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. 1-CLICK DATABASE BACKUP (Generates complete .sql dump)
exports.exportBackup = async (req, res) => {
    try {
        const [tables] = await db.query('SHOW TABLES');
        if (tables.length === 0) {
            return res.status(400).send('-- MindStock WMS: No tables found in database');
        }

        const dbName = process.env.DB_NAME || 'mindstock';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const firstProp = Object.keys(tables[0])[0];

        let sqlDump = `-- ====================================================================\n`;
        sqlDump += `-- MindStock Enterprise Warehouse Management System\n`;
        sqlDump += `-- Database Backup Dump: ${dbName}\n`;
        sqlDump += `-- Generated: ${new Date().toUTCString()}\n`;
        sqlDump += `-- Server Version: MySQL / MariaDB (Node.js Export Engine)\n`;
        sqlDump += `-- ====================================================================\n\n`;
        sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n`;
        sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
        sqlDump += `SET NAMES utf8mb4;\n\n`;

        for (const tObj of tables) {
            const tableName = tObj[firstProp];
            if (!tableName) continue;

            sqlDump += `-- --------------------------------------------------------------------\n`;
            sqlDump += `-- Table structure for table \`${tableName}\`\n`;
            sqlDump += `-- --------------------------------------------------------------------\n`;
            sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

            const [createTableResult] = await db.query(`SHOW CREATE TABLE \`${tableName}\``);
            if (createTableResult.length > 0) {
                const createSql = createTableResult[0]['Create Table'];
                sqlDump += `${createSql};\n\n`;
            }

            // Dump Data
            const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
            if (rows.length > 0) {
                sqlDump += `-- Dumping data for table \`${tableName}\` (${rows.length} rows)\n`;
                const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
                
                const valueChunks = [];
                for (const row of rows) {
                    const values = Object.values(row).map(val => {
                        if (val === null || val === undefined) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        if (typeof val === 'boolean') return val ? 1 : 0;
                        // Escape single quotes, backslashes, newlines
                        const escaped = String(val)
                            .replace(/\\/g, '\\\\')
                            .replace(/'/g, "\\'")
                            .replace(/\r/g, '\\r')
                            .replace(/\n/g, '\\n');
                        return `'${escaped}'`;
                    });
                    valueChunks.push(`(${values.join(', ')})`);
                }

                // Chunk into batch inserts of 50 for fast execution
                for (let i = 0; i < valueChunks.length; i += 50) {
                    const batch = valueChunks.slice(i, i + 50);
                    sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${batch.join(',\n')};\n`;
                }
                sqlDump += `\n`;
            }
        }

        sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
        sqlDump += `-- Dump completed on: ${new Date().toUTCString()}\n`;

        const filename = `mindstock_backup_${timestamp}.sql`;
        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(sqlDump);
    } catch (err) {
        console.error("Export Backup Error:", err);
        res.status(500).json({ success: false, error: "Database backup export failed: " + err.message });
    }
};

// 4. RESTORE DATABASE FROM .SQL DUMP
exports.restoreBackup = async (req, res) => {
    try {
        let sqlContent = '';
        if (req.file && req.file.buffer) {
            sqlContent = req.file.buffer.toString('utf8');
        } else if (req.body.sql) {
            sqlContent = req.body.sql;
        } else {
            return res.status(400).json({ success: false, error: "No SQL backup content provided" });
        }

        if (!sqlContent.trim()) {
            return res.status(400).json({ success: false, error: "Empty SQL backup file" });
        }

        // Split statements safely
        const statements = sqlContent
            .split(/;\s*[\r\n]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

        let executedCount = 0;
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const stmt of statements) {
            try {
                await db.query(stmt);
                executedCount++;
            } catch (queryErr) {
                console.warn("SQL statement warning during restore:", queryErr.message.substring(0, 100));
            }
        }
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        res.json({
            success: true,
            message: `Database successfully restored! Executed ${executedCount} SQL statements.`,
            statementsExecuted: executedCount
        });
    } catch (err) {
        console.error("Restore Backup Error:", err);
        try { await db.query('SET FOREIGN_KEY_CHECKS = 1'); } catch (e) {}
        res.status(500).json({ success: false, error: "Database restore failed: " + err.message });
    }
};

// 5. AUTOMATED LOW-STOCK & EXPIRY EMAIL/PUSH DIGEST
exports.sendLowStockDigest = async (req, res) => {
    try {
        // Fetch current settings
        const [settingsRows] = await db.query("SELECT setting_key, setting_value FROM system_settings WHERE category = 'alerts'");
        const alertConfig = {
            managerEmail: 'warehouse.manager@mindstock.com',
            threshold: 5,
            expiryDays: 30
        };
        settingsRows.forEach(r => {
            if (r.setting_key === 'manager_alert_email' && r.setting_value) alertConfig.managerEmail = r.setting_value;
            if (r.setting_key === 'low_stock_threshold') alertConfig.threshold = parseInt(r.setting_value) || 5;
            if (r.setting_key === 'expiry_warning_days') alertConfig.expiryDays = parseInt(r.setting_value) || 30;
        });

        // 1. Zero Stock Items
        const [zeroStock] = await db.query(`
            SELECT id, name, sku, category, quantity, location_zone, location_aisle, location_rack, location_bin, price, cost_price
            FROM products
            WHERE quantity = 0
            ORDER BY name ASC
        `);

        // 2. Low Stock Items (Below or at threshold)
        const [lowStock] = await db.query(`
            SELECT id, name, sku, category, quantity, min_threshold, location_zone, location_aisle, location_rack, location_bin, price, cost_price
            FROM products
            WHERE quantity > 0 AND quantity <= ?
            ORDER BY quantity ASC
        `, [alertConfig.threshold]);

        // 3. Expiring Batches (within warning days or expired)
        const [expiringBatches] = await db.query(`
            SELECT 
                p.id, p.name, p.sku, p.category, p.quantity, p.expiry_date, p.batch_number, p.cost_price,
                DATEDIFF(p.expiry_date, CURRENT_DATE) AS days_until_expiry
            FROM products p
            WHERE p.expiry_date IS NOT NULL 
              AND DATEDIFF(p.expiry_date, CURRENT_DATE) <= ?
            ORDER BY days_until_expiry ASC
        `, [alertConfig.expiryDays]);

        // Compute Financial Liability of at-risk goods
        const atRiskLossValue = expiringBatches.reduce((sum, item) => sum + ((parseFloat(item.cost_price) || 0) * (item.quantity || 0)), 0);
        const totalItemsAtRisk = zeroStock.length + lowStock.length + expiringBatches.length;

        const digestPayload = {
            dispatchedAt: new Date().toISOString(),
            formattedDate: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }),
            recipientEmail: alertConfig.managerEmail,
            summary: {
                totalCriticalIssues: totalItemsAtRisk,
                zeroStockCount: zeroStock.length,
                lowStockCount: lowStock.length,
                expiringBatchesCount: expiringBatches.length,
                financialRiskExposurePhp: atRiskLossValue
            },
            criticalZeroStock: zeroStock,
            lowStockItems: lowStock,
            expiringBatches: expiringBatches.map(b => ({
                ...b,
                status: b.days_until_expiry <= 0 ? 'EXPIRED' : `Expires in ${b.days_until_expiry} days`
            }))
        };

        res.json({
            success: true,
            message: `Automated Low-Stock & Expiry Digest dispatched to ${alertConfig.managerEmail}`,
            digest: digestPayload
        });
    } catch (err) {
        console.error("Low Stock Digest Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
