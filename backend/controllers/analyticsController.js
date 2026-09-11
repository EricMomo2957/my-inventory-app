const db = require('../config/db');

// 1. REORDER RECOMMENDATIONS (Auto-deficit calculator)
exports.getReorderRecommendations = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.id, 
                p.name, 
                p.category, 
                p.sku, 
                p.quantity, 
                p.price,
                COALESCE(p.cost_price, ROUND(p.price * 0.65, 2)) as cost_price,
                COALESCE(p.min_threshold, 5) as min_threshold,
                p.image_url,
                p.location_zone,
                p.location_aisle,
                p.location_rack,
                p.location_bin
            FROM products p
            ORDER BY p.quantity ASC
        `);

        const lowStockItems = products.filter(p => p.quantity <= (p.min_threshold || 5));
        
        const recommendations = lowStockItems.map(p => {
            const targetMax = Math.max((p.min_threshold || 5) * 4, 25);
            const deficit = Math.max(0, targetMax - p.quantity);
            const unitCost = parseFloat(p.cost_price) || 0;
            const estimatedCost = deficit * unitCost;
            const urgency = p.quantity === 0 ? 'CRITICAL' : (p.quantity <= 2 ? 'HIGH' : 'MODERATE');

            return {
                id: p.id,
                name: p.name,
                category: p.category,
                sku: p.sku || `SKU-${p.id}`,
                image_url: p.image_url,
                current_stock: p.quantity,
                min_threshold: p.min_threshold || 5,
                target_stock: targetMax,
                recommended_reorder: deficit,
                unit_cost: unitCost,
                estimated_cost: estimatedCost,
                urgency: urgency,
                location: `${p.location_zone || 'Zone A'}-${p.location_aisle || 'Aisle 01'}`
            };
        });

        const totalBudgetNeeded = recommendations.reduce((sum, r) => sum + r.estimated_cost, 0);
        const criticalItemsCount = recommendations.filter(r => r.urgency === 'CRITICAL').length;

        res.json({
            summary: {
                total_items_needing_reorder: recommendations.length,
                critical_zero_stock_items: criticalItemsCount,
                total_estimated_budget: totalBudgetNeeded,
                average_unit_cost: recommendations.length > 0 ? (totalBudgetNeeded / recommendations.reduce((s, r) => s + r.recommended_reorder, 0)) : 0
            },
            recommendations: recommendations
        });
    } catch (err) {
        console.error("Reorder Analytics Error:", err);
        res.status(500).json({ error: "Failed to generate reorder recommendations: " + err.message });
    }
};

// 2. ABC INVENTORY ANALYSIS (Pareto 80/20 Distribution)
exports.getABCAnalysis = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.id, 
                p.name, 
                p.category, 
                p.sku, 
                p.quantity, 
                p.price,
                p.image_url,
                COALESCE(p.cost_price, ROUND(p.price * 0.65, 2)) as cost_price
            FROM products p
        `);

        // Compute Total Holding Value for each SKU = Quantity * Cost Price
        const itemsWithValues = products.map(p => {
            const cost = parseFloat(p.cost_price) || 0;
            const holdingValue = (parseInt(p.quantity, 10) || 0) * cost;
            return {
                id: p.id,
                name: p.name,
                category: p.category,
                sku: p.sku || `SKU-${p.id}`,
                image_url: p.image_url,
                quantity: parseInt(p.quantity, 10) || 0,
                cost_price: cost,
                holding_value: holdingValue
            };
        });

        // Sort descending by holding value
        itemsWithValues.sort((a, b) => b.holding_value - a.holding_value);

        const totalInventoryValuation = itemsWithValues.reduce((sum, item) => sum + item.holding_value, 0);

        let cumulativeValue = 0;
        const classifiedItems = itemsWithValues.map(item => {
            cumulativeValue += item.holding_value;
            const cumulativePct = totalInventoryValuation > 0 ? (cumulativeValue / totalInventoryValuation) * 100 : 0;
            
            let abcClass = 'C';
            let priority = 'Low Holding Cost / Bulk Review';
            let color = 'slate';

            if (cumulativePct <= 70) {
                abcClass = 'A';
                priority = 'High Value / Tight Control';
                color = 'emerald';
            } else if (cumulativePct <= 90) {
                abcClass = 'B';
                priority = 'Moderate Value / Periodic Review';
                color = 'blue';
            }

            return {
                ...item,
                cumulative_pct: Math.round(cumulativePct * 10) / 10,
                abc_class: abcClass,
                priority: priority,
                color: color
            };
        });

        const classACount = classifiedItems.filter(i => i.abc_class === 'A').length;
        const classBCount = classifiedItems.filter(i => i.abc_class === 'B').length;
        const classCCount = classifiedItems.filter(i => i.abc_class === 'C').length;

        const classAValue = classifiedItems.filter(i => i.abc_class === 'A').reduce((s, i) => s + i.holding_value, 0);
        const classBValue = classifiedItems.filter(i => i.abc_class === 'B').reduce((s, i) => s + i.holding_value, 0);
        const classCValue = classifiedItems.filter(i => i.abc_class === 'C').reduce((s, i) => s + i.holding_value, 0);

        res.json({
            summary: {
                total_skus: classifiedItems.length,
                total_valuation: totalInventoryValuation,
                class_a: { count: classACount, value: classAValue, pct: totalInventoryValuation > 0 ? ((classAValue / totalInventoryValuation) * 100).toFixed(1) : 0 },
                class_b: { count: classBCount, value: classBValue, pct: totalInventoryValuation > 0 ? ((classBValue / totalInventoryValuation) * 100).toFixed(1) : 0 },
                class_c: { count: classCCount, value: classCValue, pct: totalInventoryValuation > 0 ? ((classCValue / totalInventoryValuation) * 100).toFixed(1) : 0 },
            },
            items: classifiedItems
        });
    } catch (err) {
        console.error("ABC Analysis Error:", err);
        res.status(500).json({ error: "Failed to generate ABC analysis: " + err.message });
    }
};
