 // MOCK DATA - In a real app, this comes from fetch('/api/inventory')
        let inventory = [
            { id: "IP-1001", name: "Wireless Headphones", category: "Electronics", stock: 12, min: 10 },
            { id: "IP-1002", name: "Ergonomic Chair", category: "Furniture", stock: 3, min: 5 },
            { id: "IP-1003", name: "Mechanical Keyboard", category: "Electronics", stock: 25, min: 8 },
            { id: "IP-1004", name: "USB-C Hub", category: "Electronics", stock: 4, min: 10 }
        ];

        function renderInventory() {
            const tbody = document.getElementById('inventoryBody');
            let lowCount = 0;

            tbody.innerHTML = inventory.map(item => {
                const isLow = item.stock <= item.min;
                if(isLow) lowCount++;

                return `
                    <tr>
                        <td>
                            <div style="font-weight:700;">${item.name}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted)">${item.id}</div>
                        </td>
                        <td><span style="font-size:0.85rem">${item.category}</span></td>
                        <td id="stock-val-${item.id}" style="font-weight:700;">${item.stock}</td>
                        <td>
                            <span class="status-pill ${isLow ? 'status-low' : 'status-ok'}">
                                ${isLow ? '⚠️ LOW STOCK' : '✅ HEALTHY'}
                            </span>
                        </td>
                        <td>
                            <input type="number" id="input-${item.id}" class="qty-input" placeholder="0">
                        </td>
                        <td style="text-align: right;">
                            <button class="btn-update" onclick="updateStock('${item.id}')">Save</button>
                        </td>
                    </tr>
                `;
            }).join('');

            document.getElementById('totalItems').innerText = inventory.length;
            document.getElementById('lowStockCount').innerText = lowCount;
        }

        function updateStock(id) {
            const input = document.getElementById(`input-${id}`);
            const adjustment = parseInt(input.value);
            
            if (isNaN(adjustment)) return;

            const product = inventory.find(p => p.id === id);
            if (product) {
                product.stock += adjustment;
                if (product.stock < 0) product.stock = 0;
                
                input.value = "";
                renderInventory();
                document.getElementById('lastUpdate').innerText = `Updated ${product.name} at ${new Date().toLocaleTimeString()}`;
            }
        }

        function exportToCSV() {
            const headers = ["SKU", "Product", "Category", "Stock", "Status"];
            const rows = inventory.map(item => [
                item.id,
                `"${item.name}"`,
                item.category,
                item.stock,
                item.stock <= item.min ? "Low Stock" : "OK"
            ]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            link.href = url;
            link.download = `Stock_Report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }

        function logout() {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }

        // Run on load
        renderInventory();