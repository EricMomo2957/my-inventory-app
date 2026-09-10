const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedUsers() {
    console.log("Connecting to database:", process.env.DB_NAME || 'inventory_management_db');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'inventory_management_db'
        });

        console.log("Connected to MySQL successfully.");

        // Accounts to create
        const accounts = [
            {
                username: 'admin',
                password: 'admin123',
                full_name: 'System Administrator',
                role: 'admin',
                email: 'admin@inventorypro.com',
                department: 'Executive'
            },
            {
                username: 'clerk',
                password: 'clerk123',
                full_name: 'Inventory Clerk',
                role: 'clerk',
                email: 'clerk@inventorypro.com',
                department: 'Warehouse'
            },
            {
                username: 'user',
                password: 'user123',
                full_name: 'Member Customer',
                role: 'user',
                email: 'user@inventorypro.com',
                department: 'General'
            }
        ];

        for (const acc of accounts) {
            const hashedPassword = await bcrypt.hash(acc.password, 10);
            
            // Check if user already exists
            const [existing] = await connection.query('SELECT id FROM users WHERE username = ?', [acc.username]);
            
            if (existing.length > 0) {
                // Update password & details
                await connection.query(
                    'UPDATE users SET password = ?, full_name = ?, role = ?, email = ?, department = ? WHERE username = ?',
                    [hashedPassword, acc.full_name, acc.role, acc.email, acc.department, acc.username]
                );
                console.log(`✅ Updated existing account: ${acc.username} (${acc.role})`);
            } else {
                // Insert new user
                await connection.query(
                    'INSERT INTO users (username, password, full_name, role, email, department) VALUES (?, ?, ?, ?, ?, ?)',
                    [acc.username, hashedPassword, acc.full_name, acc.role, acc.email, acc.department]
                );
                console.log(`✨ Created new account: ${acc.username} (${acc.role})`);
            }
        }

        await connection.end();
        console.log("\n🚀 Seeding completed successfully!");
    } catch (err) {
        console.error("❌ Database connection/seeding error:", err.message);
        console.log("\nMake sure XAMPP MySQL is running if you ran this locally.");
    }
}

seedUsers();
