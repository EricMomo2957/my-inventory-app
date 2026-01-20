// 1. Load Sidebar
        fetch('components/sidenav.html')
            .then(res => res.text())
            .then(data => {
                document.getElementById('sidebar-container').innerHTML = data;
                if (window.syncSidebarUI) syncSidebarUI();
            });

        // 2. Fetch and Display Orders
        async function loadOrders() {
            try {
                const res = await fetch('/api/orders');
                const orders = await res.json();
                const tableBody = document.getElementById('ordersTableBody');

                if (!orders || orders.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 20px;">No orders found.</td></tr>';
                    return;
                }

                tableBody.innerHTML = orders.map(o => `
                    <tr id="row-${o.order_id}">
                        <td><span class="order-id">#ORD-${o.order_id}</span></td>
                        <td><strong>${o.product_name}</strong></td>
                        <td><span class="category-badge">${o.category}</span></td>
                        <td>${o.order_qty}</td>
                        <td>₱${Number(o.price).toLocaleString()}</td>
                        <td>₱${Number(o.total_item_price).toLocaleString()}</td>
                        <td>${new Date(o.order_date).toLocaleString()}</td>
                        <td><span class="status-badge completed">${o.status}</span></td>
                        <td>
                            <button onclick="deleteOrder(${o.order_id})" class="delete-btn">🗑️ Delete</button>
                        </td>
                    </tr>
                `).join('');
                
            } catch (err) {
                console.error("Failed to load orders:", err);
                document.getElementById('ordersTableBody').innerHTML = 
                    '<tr><td colspan="9" style="text-align:center; color: #ef4444; padding: 20px;">Error loading orders.</td></tr>';
            }
        }

        // 3. Delete Logic
        async function deleteOrder(orderId) {
            if (!confirm(`Permanently delete Order #ORD-${orderId}?`)) return;

            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Visual feedback: fade row out
                    const row = document.getElementById(`row-${orderId}`);
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(20px)';
                    row.style.transition = '0.3s';
                    
                    setTimeout(() => loadOrders(), 300);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Failed to delete order. Server Error.");
                }
            } catch (err) {
                console.error("Delete error:", err);
                alert("Server Error. Could not connect to the database.");
            }
        }

        // 4. Search Filter
        function filterOrders() {
            const filter = document.getElementById('orderSearch').value.toLowerCase();
            const rows = document.getElementById('ordersTableBody').getElementsByTagName('tr');

            for (let i = 0; i < rows.length; i++) {
                const idCell = rows[i].cells[0];
                const nameCell = rows[i].cells[1];
                if (idCell && nameCell) {
                    const text = (idCell.textContent + nameCell.textContent).toLowerCase();
                    rows[i].style.display = text.includes(filter) ? "" : "none";
                }
            }
        }

        // 5. CSV Export
        function exportToCSV() {
            const table = document.getElementById("ordersTable");
            let csv = [];
            const rows = table.querySelectorAll("tr");

            for (let i = 0; i < rows.length; i++) {
                const row = [], cols = rows[i].querySelectorAll("td, th");
                // Loop until length - 1 to exclude the 'Actions' column
                for (let j = 0; j < cols.length - 1; j++) {
                    let data = cols[j].innerText.replace(/₱/g, '').replace(/#ORD-/g, '').replace(/,/g, '').trim();
                    row.push(`"${data}"`);
                }
                csv.push(row.join(","));
            }

            const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", `Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        window.onload = loadOrders;