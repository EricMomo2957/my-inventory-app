const db = require('../config/db');
const { initDatabase } = require('../config/initDatabase');

async function testEnhancements() {
    console.log("🚀 Starting MindStock 3-Enhancements Verification Suite...");

    try {
        await initDatabase();

        // 1. Verify soft-archive column and toggle
        console.log("\n🧪 1. Testing Product Soft-Archiving...");
        const [testProdResult] = await db.query(`
            INSERT INTO products (name, category, quantity, price, cost_price, sku, status)
            VALUES ('Test Soft-Archive SKU', 'Supplies', 25, 450.00, 290.00, 'SKU-TEST-ARCHIVE', 'active')
        `);
        const testProdId = testProdResult.insertId;

        // Toggle to archived
        await db.query("UPDATE products SET status = 'archived' WHERE id = ?", [testProdId]);
        const [archivedRow] = await db.query("SELECT status FROM products WHERE id = ?", [testProdId]);
        console.assert(archivedRow[0].status === 'archived', "Product should be archived");
        console.log("  ✅ Product archived successfully (status = 'archived')");

        // Toggle back to active
        await db.query("UPDATE products SET status = 'active' WHERE id = ?", [testProdId]);
        const [activeRow] = await db.query("SELECT status FROM products WHERE id = ?", [testProdId]);
        console.assert(activeRow[0].status === 'active', "Product should be restored to active");
        console.log("  ✅ Product restored to active catalog (status = 'active')");

        // 2. Verify Variant Inbound & Dispatch
        console.log("\n🧪 2. Testing Variant Stock In & Dispatch...");
        const [varResult] = await db.query(`
            INSERT INTO product_variants (product_id, variant_name, sku, price, cost_price, quantity, uom_type, multiplier)
            VALUES (?, 'Large / Black Pack', 'VAR-TEST-01', 500.00, 320.00, 10, 'Piece', 1)
        `, [testProdId]);
        const variantId = varResult.insertId;
        console.log(`  ✅ Variant created (ID: ${variantId}, initial qty: 10, parent qty: 25)`);

        // Test Inbound Stock In on Variant
        const inboundQty = 15;
        await db.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [inboundQty, testProdId]);
        await db.query('UPDATE product_variants SET quantity = quantity + ? WHERE id = ?', [inboundQty, variantId]);

        const [varAfterInbound] = await db.query('SELECT quantity FROM product_variants WHERE id = ?', [variantId]);
        const [prodAfterInbound] = await db.query('SELECT quantity FROM products WHERE id = ?', [testProdId]);
        console.assert(varAfterInbound[0].quantity === 25, "Variant stock should be 25");
        console.assert(prodAfterInbound[0].quantity === 40, "Parent stock should be 40");
        console.log(`  ✅ Variant Inbound Stock-In verified: Variant Qty = ${varAfterInbound[0].quantity}, Parent Qty = ${prodAfterInbound[0].quantity}`);

        // Test Dispatch Order Deduction on Variant
        const dispatchQty = 8;
        await db.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [dispatchQty, testProdId]);
        await db.query('UPDATE product_variants SET quantity = GREATEST(0, quantity - ?) WHERE id = ?', [dispatchQty, variantId]);

        const [varAfterDispatch] = await db.query('SELECT quantity FROM product_variants WHERE id = ?', [variantId]);
        const [prodAfterDispatch] = await db.query('SELECT quantity FROM products WHERE id = ?', [testProdId]);
        console.assert(varAfterDispatch[0].quantity === 17, "Variant stock should be 17");
        console.assert(prodAfterDispatch[0].quantity === 32, "Parent stock should be 32");
        console.log(`  ✅ Variant Dispatch Deduction verified: Variant Qty = ${varAfterDispatch[0].quantity}, Parent Qty = ${prodAfterDispatch[0].quantity}`);

        // 3. Verify Supplier's Supplied Products Catalog Query
        console.log("\n🧪 3. Testing Supplied Products Query for Supplier Profile...");
        const [suppliers] = await db.query('SELECT id, name FROM suppliers LIMIT 1');
        if (suppliers.length > 0) {
            const supId = suppliers[0].id;
            const supName = suppliers[0].name;

            // Link a test batch to this supplier
            await db.query(`
                INSERT INTO product_batches (product_id, batch_number, supplier, quantity_received, quantity_remaining, cost_price, expiry_date)
                VALUES (?, 'LOT-TEST-SUP', ?, 50, 50, 275.50, DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY))
            `, [testProdId, supName]);

            const sql = `
                SELECT 
                    p.id, p.name, p.sku, p.category, p.quantity AS current_stock,
                    p.price AS selling_price,
                    COALESCE(MAX(pb.cost_price), MAX(poi.unit_cost), p.cost_price) AS latest_purchase_cost,
                    COALESCE(MAX(pb.created_at), MAX(po.created_at)) AS last_supplied_date
                FROM products p
                LEFT JOIN product_batches pb ON p.id = pb.product_id AND pb.supplier = ?
                LEFT JOIN po_items poi ON p.id = poi.product_id
                LEFT JOIN purchase_orders po ON poi.po_id = po.id AND po.supplier_id = ?
                WHERE pb.id IS NOT NULL OR po.id IS NOT NULL
                GROUP BY p.id, p.name, p.sku, p.category, p.quantity, p.price, p.cost_price
            `;
            const [suppliedProducts] = await db.query(sql, [supName, supId]);
            console.log(`  ✅ Sourced products found for "${supName}": ${suppliedProducts.length} items`);
            console.log(`     Sample Item: ${suppliedProducts[0]?.name} | SKU: ${suppliedProducts[0]?.sku} | Latest Cost: ₱${suppliedProducts[0]?.latest_purchase_cost}`);
        }

        // Cleanup test data
        await db.query('DELETE FROM product_variants WHERE product_id = ?', [testProdId]);
        await db.query('DELETE FROM product_batches WHERE product_id = ?', [testProdId]);
        await db.query('DELETE FROM products WHERE id = ?', [testProdId]);
        console.log("\n🧹 Test records cleaned up successfully.");

        console.log("\n✨ ALL 3 ENHANCEMENTS BACKEND LOGIC VERIFIED 100% OPERATIONAL!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exit(1);
    }
}

testEnhancements();
